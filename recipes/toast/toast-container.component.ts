import { Component, DestroyRef, ElementRef, afterRenderEffect, booleanAttribute, effect, inject, input, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';
import { IconRef, ToastVariant } from '@semiui/tokens';
import { ToastEntry, ToastService } from './toast.service';

/** 'top-right'/'top-left'/'bottom-right'/'bottom-left' pin to that literal screen corner
 * regardless of direction. 'top-start'/'top-end'/'bottom-start'/'bottom-end' are the mirroring
 * equivalents -- start/end follow reading direction, flipping which physical corner they land in
 * under RTL. Neither is a fallback for the other; pick whichever this toast stack should do. */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'top-center'
  | 'bottom-center';

/** How many toasts deep behind the front one still get a visible (offset, dimmed) sliver when `stacked` and collapsed. */
const MAX_VISIBLE_STACK_DEPTH = 4;

/**
 * Renders the queue from `ToastService`. Mount exactly one of these, typically in the app root
 * component's template -- every `toastService.show()` call anywhere in the app appears here.
 * Auto-dismiss timers pause while a toast is hovered and restart (from the full duration, not the
 * remaining time) on mouse leave.
 */
@Component({
  selector: 's-toast-container',
  imports: [SIconComponent, NgTemplateOutlet],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
  host: {
    '[attr.data-position]': 'position()',
    '[attr.data-stacked]': 'stacked() ? \'\' : null',
    '[attr.data-expanded]': 'stacked() && expanded() ? \'\' : null',
  },
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  protected readonly icons = injectSemiUIIcons();

  position = input<ToastPosition>('top-right');
  /** Collapses toasts into a peeking deck when more than one is queued; hovering expands them into a normal list, moving the mouse away collapses them back. */
  stacked = input(false, { transform: booleanAttribute });

  private readonly toastListEl = viewChild<ElementRef<HTMLDivElement>>('toastList');

  protected readonly toasts = this.toastService.toasts;
  protected readonly expanded = signal(false);
  /**
   * The container's own box was resizing on every expand/collapse toggle (a `min-height: 3.5rem`
   * collapsed deck growing to a tall expanded list) -- and since that resize was ITSELF triggered
   * by hover, Chromium's hit-test re-evaluation after the layout shift would flip the hover target
   * for a frame, flipping `expanded` back, shrinking the box again, flipping hover again... an
   * infinite once-per-frame oscillation the instant the cursor sat still over the container.
   * Reserving the expanded height permanently (measured from the actual toasts, not guessed) means
   * the box never resizes at all -- only the children's transform/opacity change on hover -- so
   * there's no layout shift for the hit-test to react to.
   */
  protected readonly reservedHeightPx = signal<number | null>(null);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  /** Wall-clock time each toast's timer is due to fire, keyed by id -- the basis for `remainingMs`. */
  private readonly endsAt = new Map<number, number>();
  /** Snapshot of `remainingMs` taken at the moment a toast is paused (hover) -- since resuming
   * restarts from the full duration rather than the remaining time (see class doc), this is what
   * `remainingMs` reports while paused, instead of a countdown that's lying about a timer that
   * isn't actually running. */
  private readonly pausedRemainingMs = new Map<number, number>();
  /** Ticked on an interval, purely so templates reading `remainingMs()` recompute -- see the
   * ticking effect in the constructor. */
  protected readonly now = signal(Date.now());

  protected readonly maxVisibleStackDepth = MAX_VISIBLE_STACK_DEPTH;

  private readonly measureReservedHeight = afterRenderEffect(() => {
    const list = this.toasts();
    if (!this.stacked() || list.length === 0) {
      this.reservedHeightPx.set(null);
      return;
    }
    const container = this.toastListEl()?.nativeElement;
    if (!container) {
      return;
    }
    const items = Array.from(container.querySelectorAll<HTMLElement>('.s-toast'));
    if (items.length === 0) {
      return;
    }
    const gapPx = parseFloat(getComputedStyle(container).rowGap) || 0;
    const total = items.reduce((sum, el) => sum + el.offsetHeight, 0) + gapPx * (items.length - 1);
    this.reservedHeightPx.set(total);
  });

  protected stackDepth(indexFromNewest: number): number {
    return Math.min(indexFromNewest, MAX_VISIBLE_STACK_DEPTH);
  }

  protected onGroupMouseEnter(): void {
    this.expanded.set(true);
  }

  protected onGroupMouseLeave(): void {
    this.expanded.set(false);
  }

  protected dismissFn(id: number): () => void {
    return () => this.dismiss(id);
  }

  /** Milliseconds left before this toast auto-dismisses -- `null` for sticky toasts (`duration`
   * <= 0), which never count down. Passed into custom toast templates via the `#customToast`
   * context (see toast-container.component.html) for e.g. a countdown ring or "closes in Ns" label. */
  protected remainingMs(toast: ToastEntry): number | null {
    if (toast.duration <= 0) {
      return null;
    }
    const paused = this.pausedRemainingMs.get(toast.id);
    if (paused !== undefined) {
      return paused;
    }
    const endsAt = this.endsAt.get(toast.id);
    return endsAt === undefined ? toast.duration : Math.max(0, endsAt - this.now());
  }

  constructor() {
    effect(() => {
      for (const toast of this.toasts()) {
        if (toast.duration > 0 && !this.timers.has(toast.id)) {
          this.scheduleDismiss(toast);
        }
      }
    });
    /** Collapsed stacks only ever peek `maxVisibleStackDepth` cards deep -- toasts beyond that were
     * previously left in the queue just invisible (opacity 0), quietly piling up timers and DOM
     * nodes forever. Trim the oldest ones off instead, so the queue itself never grows past what's
     * visible. */
    effect(() => {
      const list = this.toasts();
      const excess = list.length - (MAX_VISIBLE_STACK_DEPTH + 1);
      if (excess <= 0) {
        return;
      }
      for (const toast of list.slice(0, excess)) {
        this.dismiss(toast.id);
      }
    });
    effect(() => {
      if (this.toasts().length === 0) {
        this.expanded.set(false);
      }
    });
    /** Keeps `now` (and so `remainingMs()`) moving while at least one toast has a real countdown
     * running. Re-reading `toasts()` (rather than just running once) means this restarts whenever
     * the queue changes -- cheap, since the interval only exists while it's actually needed, and
     * correctness doesn't depend on the tick staying perfectly phase-aligned across queue changes. */
    effect((onCleanup) => {
      const hasCountdown = this.toasts().some((toast) => toast.duration > 0);
      if (!hasCountdown) {
        return;
      }
      const handle = setInterval(() => this.now.set(Date.now()), 250);
      onCleanup(() => clearInterval(handle));
    });
    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
    });
  }

  protected variantIcon(variant: ToastVariant): IconRef | null {
    switch (variant) {
      case 'success':
        return this.icons.toastSuccess;
      case 'error':
        return this.icons.toastError;
      case 'warning':
        return this.icons.toastWarning;
      case 'info':
        return this.icons.toastInfo;
      default:
        return null;
    }
  }

  protected dismiss(id: number): void {
    this.clearTimer(id);
    this.endsAt.delete(id);
    this.pausedRemainingMs.delete(id);
    this.toastService.dismiss(id);
  }

  protected pause(id: number): void {
    const endsAt = this.endsAt.get(id);
    if (endsAt !== undefined) {
      this.pausedRemainingMs.set(id, Math.max(0, endsAt - this.now()));
      this.endsAt.delete(id);
    }
    this.clearTimer(id);
  }

  protected resume(toast: ToastEntry): void {
    if (toast.duration > 0 && !this.timers.has(toast.id)) {
      this.scheduleDismiss(toast);
    }
  }

  private scheduleDismiss(toast: ToastEntry): void {
    this.pausedRemainingMs.delete(toast.id);
    this.endsAt.set(toast.id, Date.now() + toast.duration);
    this.timers.set(
      toast.id,
      setTimeout(() => this.dismiss(toast.id), toast.duration),
    );
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}

import { Component, DestroyRef, effect, inject, input } from '@angular/core';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { injectZaytoonIcons } from '@zaytoon/theme';
import { IconRef, ToastVariant } from '@zaytoon/tokens';
import { ToastEntry, ToastService } from './toast.service';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/**
 * Renders the queue from `ToastService`. Mount exactly one of these, typically in the app root
 * component's template -- every `toastService.show()` call anywhere in the app appears here.
 * Auto-dismiss timers pause while a toast is hovered and restart (from the full duration, not the
 * remaining time) on mouse leave.
 */
@Component({
  selector: 'z-toast-container',
  imports: [ZIconComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
  host: {
    '[attr.data-position]': 'position()',
  },
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  protected readonly icons = injectZaytoonIcons();

  position = input<ToastPosition>('top-right');

  protected readonly toasts = this.toastService.toasts;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor() {
    effect(() => {
      for (const toast of this.toasts()) {
        if (toast.duration > 0 && !this.timers.has(toast.id)) {
          this.scheduleDismiss(toast);
        }
      }
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
    this.toastService.dismiss(id);
  }

  protected pause(id: number): void {
    this.clearTimer(id);
  }

  protected resume(toast: ToastEntry): void {
    if (toast.duration > 0 && !this.timers.has(toast.id)) {
      this.scheduleDismiss(toast);
    }
  }

  private scheduleDismiss(toast: ToastEntry): void {
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

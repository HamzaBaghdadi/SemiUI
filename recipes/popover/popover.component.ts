import {
  Component,
  ElementRef,
  HostListener,
  afterRenderEffect,
  booleanAttribute,
  input,
  signal,
  viewChild,
} from '@angular/core';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

const VIEWPORT_MARGIN_PX = 8;

/**
 * A popover controlled by reference from anywhere in the template -- not just its own immediate
 * DOM neighborhood. Any element's own click handler can call `po.toggle($event)` / `show($event)`
 * / `hide()`; the popover reads the event's target to know what to anchor itself to and position
 * against, using `position: fixed` so it renders correctly regardless of DOM nesting.
 *
 * ```html
 * <z-button (click)="po.toggle($event)">Click to show popover</z-button>
 * <z-popover #po><span>Popover opened!</span></z-popover>
 * ```
 */
@Component({
  selector: 'z-popover',
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.css',
})
export class PopoverComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');

  placement = input<PopoverPlacement>('bottom');
  /** Gap, in pixels, between the anchor element and the popover panel. */
  offset = input(8);
  closeOnOutsideClick = input(true, { transform: booleanAttribute });
  closeOnEscape = input(true, { transform: booleanAttribute });
  /** Hides the popover on scroll instead of repositioning it to follow the anchor. */
  closeOnScroll = input(true, { transform: booleanAttribute });
  /** Renders a small triangle pointing at the anchor. Disable if the panel might get clamped near a viewport edge, where it would no longer line up. */
  showArrow = input(true, { transform: booleanAttribute });

  protected readonly open = signal(false);
  protected readonly resolvedPlacement = signal<PopoverPlacement>('bottom');
  protected readonly position = signal({ top: 0, left: 0 });
  private anchorEl: HTMLElement | null = null;

  private readonly positionEffect = afterRenderEffect(() => {
    if (!this.open()) {
      return;
    }
    const panel = this.panel()?.nativeElement;
    if (this.anchorEl && panel) {
      this.computePosition(this.anchorEl, panel);
    }
  });

  toggle(event: Event): void {
    if (this.open()) {
      this.hide();
    } else {
      this.show(event);
    }
  }

  show(event: Event): void {
    const target = (event.currentTarget ?? event.target) as HTMLElement | null;
    if (target) {
      this.anchorEl = target;
    }
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }

  private computePosition(anchor: HTMLElement, panel: HTMLElement): void {
    const anchorRect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const gap = this.offset();

    let placement = this.placement();
    if (placement === 'bottom' && anchorRect.bottom + gap + panelRect.height > window.innerHeight) {
      placement = 'top';
    } else if (placement === 'top' && anchorRect.top - gap - panelRect.height < 0) {
      placement = 'bottom';
    }

    let top = 0;
    let left = 0;
    switch (placement) {
      case 'bottom':
        top = anchorRect.bottom + gap;
        left = anchorRect.left + anchorRect.width / 2 - panelRect.width / 2;
        break;
      case 'top':
        top = anchorRect.top - gap - panelRect.height;
        left = anchorRect.left + anchorRect.width / 2 - panelRect.width / 2;
        break;
      case 'left':
        top = anchorRect.top + anchorRect.height / 2 - panelRect.height / 2;
        left = anchorRect.left - gap - panelRect.width;
        break;
      case 'right':
        top = anchorRect.top + anchorRect.height / 2 - panelRect.height / 2;
        left = anchorRect.right + gap;
        break;
    }

    left = Math.min(Math.max(left, VIEWPORT_MARGIN_PX), window.innerWidth - panelRect.width - VIEWPORT_MARGIN_PX);
    top = Math.min(Math.max(top, VIEWPORT_MARGIN_PX), window.innerHeight - panelRect.height - VIEWPORT_MARGIN_PX);

    this.resolvedPlacement.set(placement);
    this.position.set({ top, left });
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (!this.open()) {
      return;
    }
    if (this.closeOnScroll()) {
      this.hide();
      return;
    }
    const panel = this.panel()?.nativeElement;
    if (this.anchorEl && panel) {
      this.computePosition(this.anchorEl, panel);
    }
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    const panel = this.panel()?.nativeElement;
    if (this.open() && this.anchorEl && panel) {
      this.computePosition(this.anchorEl, panel);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open() && this.closeOnEscape()) {
      this.hide();
      this.anchorEl?.focus?.();
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open() || !this.closeOnOutsideClick()) {
      return;
    }
    const target = event.target as Node;
    const panel = this.panel()?.nativeElement;
    if (panel?.contains(target) || this.anchorEl?.contains(target)) {
      return;
    }
    this.hide();
  }
}

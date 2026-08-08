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

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
export type PopoverAlign = 'start' | 'center' | 'end';

const VIEWPORT_MARGIN_PX = 8;
/** Keeps the arrow clear of the panel's rounded corners when it's tracking a far-off anchor. */
const ARROW_EDGE_MARGIN_PX = 12;

/**
 * A popover controlled by reference from anywhere in the template -- not just its own immediate
 * DOM neighborhood. Any element's own click handler can call `po.toggle($event)` / `show($event)`
 * / `hide()`; the popover reads the event's target to know what to anchor itself to and position
 * against, using `position: fixed` so it renders correctly regardless of DOM nesting.
 *
 * ```html
 * <s-button (click)="po.toggle($event)">Click to show popover</s-button>
 * <s-popover #po><span>Popover opened!</span></s-popover>
 * ```
 */
@Component({
  selector: 's-popover',
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.css',
})
export class PopoverComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');

  /** 'start'/'end' follow reading direction (flip under RTL); 'left'/'right' pin to that literal
   * physical side regardless of direction. */
  placement = input<PopoverPlacement>('bottom');
  /** Where the panel lands along the cross-axis relative to the anchor -- 'center' (default)
   * centers it, 'start'/'end' flush an edge instead. For top/bottom placements this is the
   * horizontal axis and follows reading direction the same way placement's start/end does
   * (flips under RTL); for left/right placements it's the vertical axis, which direction
   * doesn't affect. */
  align = input<PopoverAlign>('center');
  /** Gap, in pixels, between the anchor element and the popover panel. */
  offset = input(8);
  closeOnOutsideClick = input(true, { transform: booleanAttribute });
  closeOnEscape = input(true, { transform: booleanAttribute });
  /** Hides the popover on scroll instead of repositioning it to follow the anchor. */
  closeOnScroll = input(true, { transform: booleanAttribute });
  /** Renders a small triangle that tracks the anchor's actual position (clamped to stay clear of
   * the panel's corners) -- stays roughly aligned even when `align` isn't 'center' or the panel
   * gets shifted by viewport-edge clamping. */
  showArrow = input(true, { transform: booleanAttribute });
  /** Moves the panel to a direct child of `document.body`, escaping any ancestor's `overflow: hidden` clipping or `transform`/`filter` stacking context (which would otherwise break `position: fixed`). */
  appendTo = input<'body' | null>(null);

  protected readonly open = signal(false);
  protected readonly resolvedPlacement = signal<PopoverPlacement>('bottom');
  protected readonly position = signal({ top: 0, left: 0 });
  /** The arrow's offset along the cross-axis, in px from the panel's own top-left -- read by the
   * template as a CSS custom property, since a ::after pseudo-element can't be a bind target. */
  protected readonly arrowOffset = signal(0);
  private anchorEl: HTMLElement | null = null;

  private readonly positionEffect = afterRenderEffect(() => {
    if (!this.open()) {
      return;
    }
    const panel = this.panel()?.nativeElement;
    if (this.anchorEl && panel) {
      if (this.appendTo() === 'body' && panel.parentElement !== document.body) {
        document.body.appendChild(panel);
      }
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

    let placement = this.resolvePlacement(anchor);
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
        left = this.horizontalAlign(anchor, anchorRect, panelRect.width);
        break;
      case 'top':
        top = anchorRect.top - gap - panelRect.height;
        left = this.horizontalAlign(anchor, anchorRect, panelRect.width);
        break;
      case 'left':
        top = this.verticalAlign(anchorRect, panelRect.height);
        left = anchorRect.left - gap - panelRect.width;
        break;
      case 'right':
        top = this.verticalAlign(anchorRect, panelRect.height);
        left = anchorRect.right + gap;
        break;
    }

    left = Math.min(Math.max(left, VIEWPORT_MARGIN_PX), window.innerWidth - panelRect.width - VIEWPORT_MARGIN_PX);
    top = Math.min(Math.max(top, VIEWPORT_MARGIN_PX), window.innerHeight - panelRect.height - VIEWPORT_MARGIN_PX);

    this.resolvedPlacement.set(placement);
    this.position.set({ top, left });

    // The arrow always targets the anchor's true center along the cross-axis, independent of
    // `align` -- it's what makes align="start"/"end" (and viewport-edge clamping above) still
    // point at the right spot instead of sitting wherever `align` put the panel.
    const horizontal = placement === 'top' || placement === 'bottom';
    const anchorCenter = horizontal ? anchorRect.left + anchorRect.width / 2 : anchorRect.top + anchorRect.height / 2;
    const panelStart = horizontal ? left : top;
    const panelSize = horizontal ? panelRect.width : panelRect.height;
    this.arrowOffset.set(
      Math.min(Math.max(anchorCenter - panelStart, ARROW_EDGE_MARGIN_PX), panelSize - ARROW_EDGE_MARGIN_PX),
    );
  }

  /** Cross-axis position for top/bottom placements -- horizontal, so 'start'/'end' follow reading
   * direction the same way placement's start/end does. */
  private horizontalAlign(anchor: HTMLElement, anchorRect: DOMRect, panelWidth: number): number {
    const align = this.align();
    if (align === 'center') {
      return anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
    }
    const isRtl = anchor.matches(':dir(rtl)');
    const wantsLeftEdge = align === 'start' ? !isRtl : isRtl;
    return wantsLeftEdge ? anchorRect.left : anchorRect.right - panelWidth;
  }

  /** Cross-axis position for left/right placements -- vertical, which direction doesn't affect. */
  private verticalAlign(anchorRect: DOMRect, panelHeight: number): number {
    const align = this.align();
    if (align === 'center') {
      return anchorRect.top + anchorRect.height / 2 - panelHeight / 2;
    }
    return align === 'start' ? anchorRect.top : anchorRect.bottom - panelHeight;
  }

  /** 'start'/'end' resolve to whichever physical side that means for the anchor's current
   * direction; everything else passes through untouched. */
  private resolvePlacement(anchor: HTMLElement): 'top' | 'bottom' | 'left' | 'right' {
    const placement = this.placement();
    if (placement !== 'start' && placement !== 'end') {
      return placement;
    }
    const isRtl = anchor.matches(':dir(rtl)');
    if (placement === 'start') {
      return isRtl ? 'right' : 'left';
    }
    return isRtl ? 'left' : 'right';
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

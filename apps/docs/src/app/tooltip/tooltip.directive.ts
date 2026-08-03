import { ComponentRef, Directive, ElementRef, HostListener, OnDestroy, ViewContainerRef, inject, input } from '@angular/core';
import { TooltipPanelComponent } from './tooltip-panel.component';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;

/**
 * Shows a small floating label on hover/focus of the host element. The panel is a dynamically
 * created component (not a static template), so it works on any element without extra markup:
 *
 * ```html
 * <button [sTooltip]="'Save your changes'">Save</button>
 * ```
 */
@Directive({
  selector: '[sTooltip]',
})
export class TooltipDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** The tooltip text. Omit or pass an empty string to disable the tooltip entirely. */
  sTooltip = input('');
  tooltipPlacement = input<TooltipPlacement>('top');
  /** Delay, in ms, before the tooltip appears after hover/focus starts. */
  tooltipDelay = input(300);

  private panelRef: ComponentRef<TooltipPanelComponent> | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter')
  @HostListener('focus')
  protected onShow(): void {
    if (!this.sTooltip()) {
      return;
    }
    this.clearShowTimeout();
    this.showTimeout = setTimeout(() => this.show(), this.tooltipDelay());
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  @HostListener('click')
  protected onHide(): void {
    this.clearShowTimeout();
    this.hide();
  }

  ngOnDestroy(): void {
    this.clearShowTimeout();
    this.hide();
  }

  private show(): void {
    if (this.panelRef) {
      return;
    }
    this.panelRef = this.viewContainerRef.createComponent(TooltipPanelComponent);
    this.panelRef.setInput('text', this.sTooltip());
    this.panelRef.setInput('placement', this.tooltipPlacement());
    // Forces synchronous rendering so the panel's real size is measurable immediately -- both
    // detectChanges() calls happen before the browser gets a chance to paint, so there's no
    // visible flash at the wrong (0,0) position in between.
    this.panelRef.changeDetectorRef.detectChanges();
    this.updatePosition();
  }

  private hide(): void {
    this.panelRef?.destroy();
    this.panelRef = null;
  }

  /** Tooltips are tied to a stationary hover -- scrolling disrupts that context, so it hides
   *  immediately rather than chasing the anchor around (which read as janky/delayed). */
  @HostListener('window:scroll')
  protected onScroll(): void {
    this.clearShowTimeout();
    this.hide();
  }

  @HostListener('window:resize')
  protected updatePosition(): void {
    const panelRef = this.panelRef;
    if (!panelRef) {
      return;
    }
    // location.nativeElement is the <s-tooltip-panel> host, which is `display: contents` (no
    // generated box of its own) -- getBoundingClientRect() on it returns an all-zero rect, so the
    // actual .s-tooltip child has to be measured instead.
    const hostEl = panelRef.location.nativeElement as HTMLElement;
    const panelEl = (hostEl.querySelector('.s-tooltip') as HTMLElement | null) ?? hostEl;
    const anchorRect = this.elementRef.nativeElement.getBoundingClientRect();
    const panelRect = panelEl.getBoundingClientRect();

    let placement = this.tooltipPlacement();
    if (placement === 'top' && anchorRect.top - GAP_PX - panelRect.height < 0) {
      placement = 'bottom';
    } else if (placement === 'bottom' && anchorRect.bottom + GAP_PX + panelRect.height > window.innerHeight) {
      placement = 'top';
    }

    let top = 0;
    let left = 0;
    switch (placement) {
      case 'top':
        top = anchorRect.top - GAP_PX - panelRect.height;
        left = anchorRect.left + anchorRect.width / 2 - panelRect.width / 2;
        break;
      case 'bottom':
        top = anchorRect.bottom + GAP_PX;
        left = anchorRect.left + anchorRect.width / 2 - panelRect.width / 2;
        break;
      case 'left':
        top = anchorRect.top + anchorRect.height / 2 - panelRect.height / 2;
        left = anchorRect.left - GAP_PX - panelRect.width;
        break;
      case 'right':
        top = anchorRect.top + anchorRect.height / 2 - panelRect.height / 2;
        left = anchorRect.right + GAP_PX;
        break;
    }

    left = Math.min(Math.max(left, VIEWPORT_MARGIN_PX), window.innerWidth - panelRect.width - VIEWPORT_MARGIN_PX);
    top = Math.min(Math.max(top, VIEWPORT_MARGIN_PX), window.innerHeight - panelRect.height - VIEWPORT_MARGIN_PX);

    panelRef.setInput('placement', placement);
    panelRef.setInput('top', top);
    panelRef.setInput('left', left);
    panelRef.changeDetectorRef.detectChanges();
  }

  private clearShowTimeout(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }
}

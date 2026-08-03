import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  TemplateRef,
  afterRenderEffect,
  booleanAttribute,
  contentChild,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ZIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';
import { DialogSize } from '@semiui/tokens';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * A panel that slides in from a viewport edge, controlled by reference like Dialog: call
 * `drawer.show()` / `hide()` / `toggle()` from anywhere. Same behavior as Dialog under the hood
 * (portals to `document.body`, traps focus, locks background scroll, restores focus on close) --
 * the difference is purely presentational: an edge-anchored sliding panel instead of a centered
 * one.
 */
@Component({
  selector: 'z-drawer',
  imports: [ZIconComponent, NgTemplateOutlet],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css',
})
export class DrawerComponent {
  protected readonly icons = injectSemiUIIcons();
  private readonly backdrop = viewChild<ElementRef<HTMLDivElement>>('backdrop');
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');

  title = input('');
  side = input<DrawerSide>('right');
  /** Controls the panel's width (left/right drawers) or height (top/bottom drawers). */
  size = input<DialogSize>('md');
  closable = input(true, { transform: booleanAttribute });
  closeOnOutsideClick = input(true, { transform: booleanAttribute });
  closeOnEscape = input(true, { transform: booleanAttribute });
  /** Blurs whatever is behind the backdrop, in addition to dimming it. */
  blurBackdrop = input(false, { transform: booleanAttribute });
  /** Hides the dimming/blur backdrop entirely -- the panel still portals, traps focus, and locks scroll, it just doesn't visually cover the page behind it. */
  showBackdrop = input(true, { transform: booleanAttribute });

  /** Custom header content, replacing the plain `title` text. The close button (if `closable`) still renders alongside it. */
  protected headerTemplate = contentChild<unknown, TemplateRef<unknown>>('header', { read: TemplateRef });
  /** Rendered below the main content, typically action buttons. */
  protected footerTemplate = contentChild<unknown, TemplateRef<unknown>>('footer', { read: TemplateRef });
  /** Replaces the entire header/body/footer chrome with raw projected content -- still gets the portal, focus trap, and animations, just none of the default layout/padding/title/close button. */
  protected headlessTemplate = contentChild<unknown, TemplateRef<unknown>>('headless', { read: TemplateRef });

  protected readonly open = signal(false);
  private previouslyFocusedEl: HTMLElement | null = null;

  /** See the equivalent effect in DialogComponent for why the backdrop (not the panel) is moved. */
  private readonly moveToBodyAndFocus = afterRenderEffect(() => {
    if (!this.open()) {
      return;
    }
    const backdrop = this.backdrop()?.nativeElement;
    if (!backdrop) {
      return;
    }
    if (backdrop.parentElement !== document.body) {
      document.body.appendChild(backdrop);
    }
    this.panel()?.nativeElement.focus();
  });

  show(): void {
    if (this.open()) {
      return;
    }
    this.previouslyFocusedEl = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    this.open.set(true);
  }

  hide(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    document.body.style.overflow = '';
    this.previouslyFocusedEl?.focus?.();
    this.previouslyFocusedEl = null;
  }

  toggle(): void {
    if (this.open()) {
      this.hide();
    } else {
      this.show();
    }
  }

  protected onBackdropClick(): void {
    if (this.closeOnOutsideClick()) {
      this.hide();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open() && this.closeOnEscape()) {
      this.hide();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return;
    }
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

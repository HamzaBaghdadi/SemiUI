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
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';
import { DialogSize } from '@semiui/tokens';

/**
 * A modal dialog, controlled by reference like Popover: call `dlg.show()` / `dlg.hide()` /
 * `dlg.toggle()` from anywhere. Always portals to `document.body` (a modal nested in page flow
 * defeats the point), traps Tab/Shift+Tab focus within itself while open, locks background
 * scroll, and restores focus to whatever triggered it on close.
 *
 * ```html
 * <s-button (click)="dlg.show()">Open</s-button>
 * <s-dialog #dlg title="Confirm">
 *   <p>Are you sure?</p>
 *   <ng-template #footer>
 *     <button (click)="dlg.hide()">Cancel</button>
 *   </ng-template>
 * </s-dialog>
 * ```
 */
@Component({
  selector: 's-dialog',
  imports: [SIconComponent, NgTemplateOutlet],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  protected readonly icons = injectSemiUIIcons();
  private readonly backdrop = viewChild<ElementRef<HTMLDivElement>>('backdrop');
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');

  title = input('');
  size = input<DialogSize>('md');
  /** Shows the "x" close button in the header. */
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

  /** Fires whenever the dialog closes, regardless of trigger (button, outside click, escape, `hide()`). */
  closed = output<void>();

  protected readonly open = signal(false);
  private previouslyFocusedEl: HTMLElement | null = null;

  /**
   * Moves the *backdrop* (the `@if` block's actual root element) to `document.body`, not the
   * panel nested inside it -- Angular's view teardown removes a destroyed view by acting on its
   * tracked root DOM nodes, and relies on ordinary DOM parent/child nesting to take any relocated
   * descendants along with it. Moving only the inner panel out from under its own view's root
   * breaks that assumption: closing would remove the (by-then-childless) backdrop while the panel,
   * now living directly under <body>, is orphaned and never cleaned up.
   */
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
    this.closed.emit();
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

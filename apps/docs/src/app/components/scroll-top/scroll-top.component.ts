import { Component, HostListener, booleanAttribute, input, signal } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { ButtonVariant, IconRef } from '@semiui/tokens';
import { injectSemiUIIcons } from '@semiui/theme';

/**
 * A floating action button that appears once the page has scrolled past `threshold`, and scrolls
 * back to the top on click. Defaults to chevronDown rotated 180deg for its icon (there's no
 * dedicated "up" glyph in the shared icon token set, and adding one would mean extending it for a
 * single component) -- pass `icon` to override.
 */
@Component({
  selector: 's-scroll-top',
  imports: [SIconComponent],
  templateUrl: './scroll-top.component.html',
  styleUrl: './scroll-top.component.css',
  host: {
    class: 's-scroll-top',
    '[attr.data-visible]': 'visible() ? \'\' : null',
    '[attr.data-variant]': 'variant()',
  },
})
export class ScrollTopComponent {
  protected readonly icons = injectSemiUIIcons();

  /** Scroll distance (px) past which the button appears. */
  threshold = input(300);
  smooth = input(true, { transform: booleanAttribute });
  variant = input<ButtonVariant>('primary');
  icon = input<IconRef>();
  ariaLabel = input('Scroll to top');

  protected readonly visible = signal(false);

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.visible.set(window.scrollY > this.threshold());
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: this.smooth() ? 'smooth' : 'auto' });
  }
}

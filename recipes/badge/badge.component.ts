import { Component, booleanAttribute, computed, input } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { IconRef, TagVariant } from '@semiui/tokens';

/** 'top-right'/'top-left'/'bottom-right'/'bottom-left' pin to that literal physical corner of the
 * wrapped content regardless of direction. 'top-start'/'top-end'/'bottom-start'/'bottom-end' are
 * the mirroring equivalents -- start/end follow reading direction, flipping which physical corner
 * they land in under RTL. Neither is a fallback for the other; pick whichever this badge should do. */
export type BadgePosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

/**
 * A small notification indicator. Its own content is one of, in priority order: `dot` (nothing,
 * just a small filled circle), `icon` (renders a `s-icon`), `label` (arbitrary text, shown as-is),
 * or `count` (a number, "N+" once past `max`) -- not only a number, despite `count` being the most
 * common case. By default it overlays whatever is projected into it (an icon, an avatar); set
 * `standalone` to render inline instead, e.g. next to a text label.
 */
@Component({
  selector: 's-badge',
  imports: [SIconComponent],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
  host: {
    '[attr.data-standalone]': 'standalone() ? \'\' : null',
  },
})
export class BadgeComponent {
  count = input<number>();
  /** Arbitrary text content, e.g. "NEW" or "Beta" -- takes priority over `count` when set. */
  label = input<string>();
  /** Renders this icon as the badge's content instead of text -- takes priority over both `label` and `count`. */
  icon = input<IconRef>();
  max = input(99);
  dot = input(false, { transform: booleanAttribute });
  /** Shows the badge even when `count` is exactly 0 (default hides it). Irrelevant when `label`/`icon` is set. */
  showZero = input(false, { transform: booleanAttribute });
  variant = input<TagVariant>('primary');
  position = input<BadgePosition>('top-right');
  /** Renders inline instead of as an absolutely-positioned overlay on the projected content. */
  standalone = input(false, { transform: booleanAttribute });
  /** Overrides the auto-generated aria-label. Useful when using `icon` without `label`, since an icon alone has no default text to announce. */
  ariaLabel = input<string>();

  protected readonly resolvedAriaLabel = computed(() => {
    const override = this.ariaLabel();
    if (override !== undefined) {
      return override;
    }
    if (this.dot()) {
      return 'Unread notification';
    }
    const label = this.label();
    if (label !== undefined) {
      return label;
    }
    const count = this.count();
    return count !== undefined ? `${count} notifications` : null;
  });

  protected readonly displayValue = computed(() => {
    const count = this.count();
    if (count === undefined) {
      return '';
    }
    const max = this.max();
    return count > max ? `${max}+` : String(count);
  });

  protected readonly shouldShow = computed(() => {
    if (this.dot() || this.icon() || this.label() !== undefined) {
      return true;
    }
    const count = this.count();
    if (count === undefined) {
      return false;
    }
    return count !== 0 || this.showZero();
  });
}

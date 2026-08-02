import { Component, booleanAttribute, computed, input } from '@angular/core';
import { TagVariant } from '@zaytoon/tokens';

export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/**
 * A small notification indicator -- a number, "N+" once past `max`, or a plain dot. By default it
 * overlays whatever is projected into it (an icon, an avatar); set `standalone` to render inline
 * instead, e.g. next to a text label.
 */
@Component({
  selector: 'z-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
  host: {
    '[attr.data-standalone]': 'standalone() ? \'\' : null',
  },
})
export class BadgeComponent {
  count = input<number>();
  max = input(99);
  dot = input(false, { transform: booleanAttribute });
  /** Shows the badge even when `count` is exactly 0 (default hides it). */
  showZero = input(false, { transform: booleanAttribute });
  variant = input<TagVariant>('primary');
  position = input<BadgePosition>('top-right');
  /** Renders inline instead of as an absolutely-positioned overlay on the projected content. */
  standalone = input(false, { transform: booleanAttribute });

  protected readonly displayValue = computed(() => {
    const count = this.count();
    if (count === undefined) {
      return '';
    }
    const max = this.max();
    return count > max ? `${max}+` : String(count);
  });

  protected readonly shouldShow = computed(() => {
    const count = this.count();
    if (count === undefined) {
      return true;
    }
    return count !== 0 || this.showZero();
  });
}

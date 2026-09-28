import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { IconRef } from '@semiui/tokens';

/**
 * Renders an IconRef: either a name registered with ng-icons, or raw inline SVG markup. A ref
 * flagged `flipInRtl` is mirrored horizontally under a right-to-left direction.
 */
@Component({
  selector: 's-icon',
  imports: [NgIcon],
  host: {
    '[attr.data-flip-rtl]': 'ref().flipInRtl ? "" : null',
  },
  template: `
    @if (ref().type === 'ng-icon') {
      <ng-icon [name]="ngIconName()" />
    } @else {
      <ng-icon [svg]="svgMarkup()" />
    }
  `,
  styles: `
    /*
     * Centers ng-icon's own natural-size SVG within whatever box a consumer allocates for s-icon
     * -- without forcing an explicit width/height on ng-icon itself. That was tried and reverted:
     * forcing ng-icon to 100%/100% only resolves sensibly when s-icon's own host has a DEFINITE
     * size from the consumer (e.g. Avatar's fallback icon, sized to 55% of the avatar). Consumers
     * that size s-icon's box via its child's natural SVG dimensions instead (no explicit size on
     * s-icon itself, e.g. Password's toggle icon) have no definite size for the percentage to
     * resolve against, so the browser falls back unpredictably -- which is exactly what made the
     * password toggle icon balloon in size. Centering alone (no forced dimensions) fixes the
     * off-center icon without that regression.
     */
    :host,
    ng-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /*
     * The mirror is applied to the inner ng-icon, not the host, so it composes with whatever
     * transform the consumer puts on <s-icon> itself (an open/closed rotation, say) instead of
     * fighting it for the same property. :dir() reads the resolved direction, so it needs no
     * dir="rtl" ancestor selector and follows a per-element dir attribute too.
     */
    :host([data-flip-rtl]) ng-icon:dir(rtl) {
      transform: scaleX(-1);
    }
  `,
})
export class SIconComponent {
  ref = input.required<IconRef>();

  protected ngIconName = computed(() => {
    const ref = this.ref();
    return ref.type === 'ng-icon' ? ref.name : '';
  });

  protected svgMarkup = computed(() => {
    const ref = this.ref();
    return ref.type === 'svg' ? ref.markup : '';
  });
}

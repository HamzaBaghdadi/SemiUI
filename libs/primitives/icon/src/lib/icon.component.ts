import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { IconRef } from '@zaytoon/tokens';

/** Renders an IconRef: either a name registered with ng-icons, or raw inline SVG markup. */
@Component({
  selector: 'z-icon',
  imports: [NgIcon],
  template: `
    @if (ref().type === 'ng-icon') {
      <ng-icon [name]="ngIconName()" />
    } @else {
      <ng-icon [svg]="svgMarkup()" />
    }
  `,
  styles: `
    /*
     * Centers ng-icon's own natural-size SVG within whatever box a consumer allocates for z-icon
     * -- without forcing an explicit width/height on ng-icon itself. That was tried and reverted:
     * forcing ng-icon to 100%/100% only resolves sensibly when z-icon's own host has a DEFINITE
     * size from the consumer (e.g. Avatar's fallback icon, sized to 55% of the avatar). Consumers
     * that size z-icon's box via its child's natural SVG dimensions instead (no explicit size on
     * z-icon itself, e.g. Password's toggle icon) have no definite size for the percentage to
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
  `,
})
export class ZIconComponent {
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

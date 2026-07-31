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

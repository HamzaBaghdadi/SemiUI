import { Component, ViewEncapsulation, input } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { IconRef } from '@semiui/tokens';

/**
 * A container that adds a leading or trailing icon to *any* SemiUI field -- projects the field as
 * content and reserves room for the icon on whichever side.
 *
 * ```html
 * <s-icon-field [icon]="{ type: 'ng-icon', name: 'lucideSearch' }">
 *   <s-text-input placeholder="Search" />
 * </s-icon-field>
 * ```
 *
 * Unlike most recipes, this one uses `ViewEncapsulation.None`: the icon's padding has to land
 * inside the *projected* field's own stylesheet (its padding, not this wrapper's), and Angular's
 * default emulated encapsulation blocks a parent's styles from reaching into a child component's
 * internals. Every selector below is still scoped under the root `.s-icon-field` class by hand, so
 * nothing leaks out to affect unrelated elements elsewhere on the page. It reaches native-input-
 * based fields (Text Input, Password, Textarea, Input Number, Auto Complete) via the `sInput`
 * marker directive they all carry, and the button-triggered listbox fields (Select, Multiselect,
 * Cascade Select) by their known trigger class -- there's no single shared marker for those the
 * way `sInput` covers the native ones.
 */
@Component({
  selector: 's-icon-field',
  imports: [SIconComponent],
  templateUrl: './icon-field.component.html',
  styleUrl: './icon-field.component.css',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 's-icon-field',
    '[attr.data-icon-position]': 'iconPosition()',
  },
})
export class IconFieldComponent {
  icon = input<IconRef>();
  /** Which side the icon sits on -- the projected field's own padding on that side is reserved for it. */
  iconPosition = input<'left' | 'right'>('left');
}

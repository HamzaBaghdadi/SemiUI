import { Component, ViewEncapsulation, input } from '@angular/core';

export type FloatLabelVariant = 'over' | 'on' | 'in';

/**
 * A floating label wrapper for *any* SemiUI field -- merges PrimeNG's separate FloatLabel and
 * IftaLabel into one component via `variant`. Projects the field as content; the label rests over
 * the field's own text area until the field is focused or filled, then floats.
 *
 * ```html
 * <s-float-label label="Email address">
 *   <s-text-input [(ngModel)]="email" />
 * </s-float-label>
 * ```
 *
 * Pure CSS, no JS state tracking: `:focus-within` covers the focused case for any wrapped field,
 * and "filled" is detected per field kind --
 * native-input-based fields (Text Input, Password, Textarea, Input Number, Auto Complete, Icon
 * Field) via `:not(:placeholder-shown)`, which needs the wrapped field to carry a `placeholder`
 * attribute (pass at least `placeholder=" "` if it has no natural placeholder of its own);
 * button-triggered listbox fields (Select, Multiselect, Cascade Select) via the absence of their
 * own dedicated empty-state placeholder element.
 *
 * Like Icon Field, this uses `ViewEncapsulation.None` since the detection selectors need to read
 * the *projected* field's internals, which emulated encapsulation would otherwise block -- every
 * selector is still scoped under the root `.s-float-label` class by hand.
 */
@Component({
  selector: 's-float-label',
  templateUrl: './float-label.component.html',
  styleUrl: './float-label.component.css',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 's-float-label',
    '[attr.data-variant]': 'variant()',
  },
})
export class FloatLabelComponent {
  label = input.required<string>();
  /** 'over': floats fully clear of the border, like classic Material. 'on': floats to sit on the
   * border line itself. 'in': stays inside the field's own box, just shrinking toward the top
   * (PrimeNG's IftaLabel). */
  variant = input<FloatLabelVariant>('over');
}

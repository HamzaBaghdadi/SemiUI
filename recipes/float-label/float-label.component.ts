import { Component, ElementRef, ViewEncapsulation, afterNextRender, inject, input, signal } from '@angular/core';

export type FloatLabelVariant = 'over' | 'on' | 'in';

/** The first control inside the wrapper that a label should name. */
const CONTROL_SELECTOR = 'input:not([type="hidden"]), textarea, select, button[role="combobox"], [role="combobox"]';
/** Elements a `<label for>` can point at; anything else is named through `aria-labelledby` instead. */
const LABELABLE = /^(INPUT|TEXTAREA|SELECT|BUTTON)$/;

let nextFloatLabelId = 0;

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
 * The label is also tied to the wrapped control for assistive technology: `for` when the control is a
 * native input, textarea, select or button (Select's trigger), `aria-labelledby` otherwise
 * (Multiselect's div trigger). A control that already names itself -- an `id` you set, an
 * `aria-label`, an `aria-labelledby` -- is left as it is.
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly baseId = `s-float-label-${nextFloatLabelId++}`;

  protected readonly labelId = `${this.baseId}-label`;
  /** The `id` the label's `for` points at, once a labelable control has been found inside. */
  protected readonly controlId = signal<string | null>(null);

  label = input.required<string>();
  /** 'over': floats fully clear of the border, like classic Material. 'on': floats to sit on the
   * border line itself. 'in': stays inside the field's own box, just shrinking toward the top
   * (PrimeNG's IftaLabel). */
  variant = input<FloatLabelVariant>('over');

  constructor() {
    afterNextRender(() => this.associateLabel());
  }

  private associateLabel(): void {
    const control = this.host.nativeElement.querySelector<HTMLElement>(CONTROL_SELECTOR);
    if (!control) {
      return;
    }
    if (LABELABLE.test(control.tagName)) {
      if (!control.id) {
        control.id = `${this.baseId}-control`;
      }
      this.controlId.set(control.id);
    } else if (!control.hasAttribute('aria-label') && !control.hasAttribute('aria-labelledby')) {
      control.setAttribute('aria-labelledby', this.labelId);
    }
  }
}

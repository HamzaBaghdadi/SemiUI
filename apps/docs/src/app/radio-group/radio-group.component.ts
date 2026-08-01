import { Component, input } from '@angular/core';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { ButtonSize } from '@zaytoon/tokens';
import { ErrorMessageComponent } from '../error-message/error-message.component';

let nextRadioGroupId = 0;

/**
 * A radio group: renders one native `<input type="radio">` per option, all sharing a generated
 * `name` so arrow-key navigation between them is free native browser behavior. Options follow the
 * same shape as Select -- plain values, or objects via `optionLabel` / `optionValue`. Supports
 * ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl`.
 */
@Component({
  selector: 'z-radio-group',
  imports: [ErrorMessageComponent],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.css',
  host: {
    role: 'radiogroup',
  },
})
export class RadioGroupComponent<TOption = unknown> extends BaseFormFieldControl<unknown> {
  options = input<readonly TOption[]>([]);
  /** Property to read the display label from, when options are objects. Omit for primitive options. */
  optionLabel = input<string>();
  /** Property to read the bound value from, when options are objects. Omit to use the whole option as the value. */
  optionValue = input<string>();
  /** Property to read a per-option disabled flag from, when options are objects. */
  optionDisabled = input<string>();
  errorMessage = input('');
  size = input<ButtonSize>('md');
  direction = input<'vertical' | 'horizontal'>('vertical');

  protected readonly groupName = `z-radio-group-${nextRadioGroupId++}`;

  protected override emptyValue(): unknown {
    return undefined;
  }

  protected labelFor(option: TOption): string {
    const key = this.optionLabel();
    if (!key) {
      return String(option);
    }
    return String((option as Record<string, unknown>)[key]);
  }

  protected isSelected(option: TOption): boolean {
    return this.value() === this.resolveValue(option);
  }

  protected isOptionDisabled(option: TOption): boolean {
    const key = this.optionDisabled();
    return key ? !!(option as Record<string, unknown>)[key] : false;
  }

  protected select(option: TOption): void {
    if (this.effectiveDisabled() || this.isOptionDisabled(option)) {
      return;
    }
    this.value.set(this.resolveValue(option));
  }

  private resolveValue(option: TOption): unknown {
    const key = this.optionValue();
    return key ? (option as Record<string, unknown>)[key] : option;
  }
}

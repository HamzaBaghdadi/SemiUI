import { Component, ElementRef, booleanAttribute, input, viewChild } from '@angular/core';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { ButtonSize } from '@zaytoon/tokens';
import { injectZaytoonIcons } from '@zaytoon/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

/**
 * A checkbox: supports ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl`.
 * Built on a real native `<input type="checkbox">` (visually hidden, styled via a sibling box) so
 * keyboard interaction and assistive tech semantics come for free.
 */
@Component({
  selector: 'z-checkbox',
  imports: [ZIconComponent, ErrorMessageComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
})
export class CheckboxComponent extends BaseFormFieldControl<boolean> {
  protected readonly icons = injectZaytoonIcons();
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  label = input('');
  errorMessage = input('');
  size = input<ButtonSize>('md');
  /**
   * Visually shows a dash instead of a checkmark, regardless of `value`. Purely presentational --
   * setting this doesn't change the bound value, matching the native `indeterminate` DOM property.
   */
  indeterminate = input(false, { transform: booleanAttribute });

  protected override emptyValue(): boolean {
    return false;
  }

  focus(options?: FocusOptions): void {
    this.nativeInput()?.nativeElement.focus(options);
  }

  protected onChange(checked: boolean): void {
    this.value.set(checked);
  }
}

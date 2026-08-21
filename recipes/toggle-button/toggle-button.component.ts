import { Component, ElementRef, input, viewChild } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { ButtonSize, ButtonVariant, IconRef } from '@semiui/tokens';
import { ErrorMessageComponent } from '../error-message/error-message.component';

/**
 * A two-state button: supports ngModel, reactive forms, and Signal Forms through
 * `BaseFormFieldControl`. Unpressed reads as an outlined button in `variant`'s color; pressed
 * fills solid, the same look a regular Button of that variant has.
 */
@Component({
  selector: 's-toggle-button',
  imports: [SIconComponent, ErrorMessageComponent],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.css',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '(focusout)': 'handleBlur()',
  },
})
export class ToggleButtonComponent extends BaseFormFieldControl<boolean> {
  private readonly button = viewChild<ElementRef<HTMLButtonElement>>('button');

  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  /** Label shown while pressed. */
  onLabel = input('Yes');
  /** Label shown while unpressed. */
  offLabel = input('No');
  /** Icon shown while pressed, in place of onLabel's text if set alongside it. */
  onIcon = input<IconRef>();
  /** Icon shown while unpressed, in place of offLabel's text if set alongside it. */
  offIcon = input<IconRef>();
  errorMessage = input('');

  protected override emptyValue(): boolean {
    return false;
  }

  focus(options?: FocusOptions): void {
    this.button()?.nativeElement.focus(options);
  }

  protected override focusTarget(): HTMLElement | null {
    return this.button()?.nativeElement ?? null;
  }

  protected toggle(): void {
    if (this.effectiveDisabled()) {
      return;
    }
    this.value.set(!this.value());
  }
}

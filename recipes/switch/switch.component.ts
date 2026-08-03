import { Component, ElementRef, input, viewChild } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { ButtonSize, IconRef } from '@semiui/tokens';
import { ErrorMessageComponent } from '../error-message/error-message.component';

let nextSwitchId = 0;

/**
 * A toggle switch: supports ngModel, reactive forms, and Signal Forms through
 * `BaseFormFieldControl`. The thumb's travel distance is computed in CSS from the track/thumb
 * size tokens, so it stays visually centered regardless of preset or size.
 */
@Component({
  selector: 's-switch',
  imports: [SIconComponent, ErrorMessageComponent],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.css',
})
export class SwitchComponent extends BaseFormFieldControl<boolean> {
  private readonly track = viewChild<ElementRef<HTMLButtonElement>>('track');

  label = input('');
  errorMessage = input('');
  size = input<ButtonSize>('md');
  /** Icon shown inside the thumb when on. Omitted by default -- a plain thumb. */
  onIcon = input<IconRef>();
  /** Icon shown inside the thumb when off. Omitted by default -- a plain thumb. */
  offIcon = input<IconRef>();

  protected readonly labelId = `s-switch-label-${nextSwitchId++}`;

  protected override emptyValue(): boolean {
    return false;
  }

  focus(options?: FocusOptions): void {
    this.track()?.nativeElement.focus(options);
  }

  protected toggle(): void {
    if (this.effectiveDisabled()) {
      return;
    }
    this.value.set(!this.value());
  }
}

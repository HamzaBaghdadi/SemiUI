import { Component, ElementRef, input, viewChild } from '@angular/core';
import { InputDirective } from '@zaytoon/primitives/input';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export type TextInputType = 'text' | 'email' | 'tel' | 'url' | 'number' | 'search';

@Component({
  selector: 'z-text-input',
  imports: [InputDirective, ErrorMessageComponent],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css',
})
export class TextInputComponent extends BaseFormFieldControl<string> {
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  type = input<TextInputType>('text');
  placeholder = input('');
  errorMessage = input('');

  protected override emptyValue(): string {
    return '';
  }

  focus(options?: FocusOptions): void {
    this.nativeInput()?.nativeElement.focus(options);
  }

  protected onInput(value: string): void {
    this.value.set(value);
  }
}

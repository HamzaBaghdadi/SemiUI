import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
import { InputDirective } from '@semiui/primitives/input';
import { ButtonDirective } from '@semiui/primitives/button';
import { ZIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { IconRef } from '@semiui/tokens';
import { injectSemiUIIcons } from '@semiui/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
  selector: 'z-password',
  imports: [InputDirective, ButtonDirective, ZIconComponent, ErrorMessageComponent],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css',
})
export class PasswordComponent extends BaseFormFieldControl<string> {
  private readonly icons = injectSemiUIIcons();
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  placeholder = input('');
  errorMessage = input('');
  /** Whether the reveal-password toggle button is shown at all. */
  showMask = input(true);

  protected revealed = signal(false);
  protected inputType = computed(() => (this.revealed() ? 'text' : 'password'));
  protected toggleIcon = computed<IconRef>(() => (this.revealed() ? this.icons.passwordHide : this.icons.passwordShow));

  protected override emptyValue(): string {
    return '';
  }

  focus(options?: FocusOptions): void {
    this.nativeInput()?.nativeElement.focus(options);
  }

  protected onInput(value: string): void {
    this.value.set(value);
  }

  protected toggleReveal(): void {
    this.revealed.update((value) => !value);
  }
}

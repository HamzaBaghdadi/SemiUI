import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
import { InputDirective } from '@zaytoon/primitives/input';
import { ButtonDirective } from '@zaytoon/primitives/button';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { IconRef } from '@zaytoon/tokens';

@Component({
  selector: 'z-password',
  imports: [InputDirective, ButtonDirective, ZIconComponent],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css',
})
export class PasswordComponent extends BaseFormFieldControl<string> {
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  placeholder = input('');
  errorMessage = input('');
  /** Whether the reveal-password toggle button is shown at all. */
  showMask = input(true);

  protected revealed = signal(false);
  protected inputType = computed(() => (this.revealed() ? 'text' : 'password'));
  protected toggleIcon = computed<IconRef>(() =>
    this.revealed() ? { type: 'ng-icon', name: 'lucideEyeOff' } : { type: 'ng-icon', name: 'lucideEye' },
  );

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

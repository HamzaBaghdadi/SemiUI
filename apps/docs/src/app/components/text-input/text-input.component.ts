import { Component, ElementRef, booleanAttribute, computed, input, viewChild } from '@angular/core';
import { InputDirective } from '@semiui/primitives/input';
import { ButtonDirective } from '@semiui/primitives/button';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { injectSemiUIIcons } from '@semiui/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export type TextInputType = 'text' | 'email' | 'tel' | 'url' | 'number' | 'search';

@Component({
  selector: 's-text-input',
  imports: [InputDirective, ButtonDirective, SIconComponent, ErrorMessageComponent],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css',
})
export class TextInputComponent extends BaseFormFieldControl<string> {
  protected readonly icons = injectSemiUIIcons();
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  type = input<TextInputType>('text');
  placeholder = input('');
  errorMessage = input('');
  /**
   * Shows a clear button inside the field once it holds a value.
   *
   * Opt-in, unlike Select and the other listbox fields where it defaults to on: those have no
   * keyboard-only way to empty a selection, whereas a text input is already clearable by selecting
   * its contents and typing over them, so the button is only worth its space when asked for.
   */
  clearable = input(false, { transform: booleanAttribute });

  /** Same name and shape as the listbox fields' own gate: the button appears only when it has
   * something to clear and the field can still be edited. */
  protected readonly showClear = computed(() => this.clearable() && !this.effectiveDisabled() && this.value().length > 0);

  protected override emptyValue(): string {
    return '';
  }

  focus(options?: FocusOptions): void {
    this.nativeInput()?.nativeElement.focus(options);
  }

  protected override focusTarget(): HTMLElement | null {
    return this.nativeInput()?.nativeElement ?? null;
  }

  protected onInput(value: string): void {
    this.value.set(value);
  }

  /** Empties the field and hands focus back to the input -- the button unmounts on the same tick
   * (`showClear` goes false), so leaving focus on it would drop it to the body and lose the user's
   * place in the form. */
  protected clear(): void {
    this.value.set(this.emptyValue());
    this.nativeInput()?.nativeElement.focus();
  }
}

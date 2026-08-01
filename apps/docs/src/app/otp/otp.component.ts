import { Component, booleanAttribute, computed, ElementRef, input, viewChildren } from '@angular/core';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { ErrorMessageComponent } from '../error-message/error-message.component';

/**
 * A one-time-password input: `length` individual boxes, auto-advancing focus as you type,
 * Backspace/arrow-key navigation between boxes, and paste support (pasting a full code fills
 * every box at once). The bound value is the concatenated string. Supports ngModel, reactive
 * forms, and Signal Forms through `BaseFormFieldControl`.
 */
@Component({
  selector: 'z-otp',
  imports: [ErrorMessageComponent],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css',
})
export class OtpComponent extends BaseFormFieldControl<string> {
  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');

  length = input(6);
  errorMessage = input('');
  /** Restricts input to digits (default) or allows letters and digits. */
  type = input<'numeric' | 'alphanumeric'>('numeric');
  /** Renders each box as a password field (dots instead of the typed character). */
  mask = input(false, { transform: booleanAttribute });

  protected readonly indices = computed(() => Array.from({ length: this.length() }, (_, i) => i));
  protected readonly digits = computed(() => {
    const value = this.value();
    return this.indices().map((i) => value[i] ?? '');
  });

  protected override emptyValue(): string {
    return '';
  }

  focus(options?: FocusOptions): void {
    this.boxes()[0]?.nativeElement.focus(options);
  }

  protected onBoxInput(index: number, raw: string): void {
    const char = this.sanitize(raw.slice(-1));
    if (!char) {
      // Rejected keystroke: the native input already shows the raw (invalid) character since it's
      // an uncontrolled DOM write from the keystroke itself -- reset it back to the canonical value.
      const el = this.boxes()[index]?.nativeElement;
      if (el) {
        el.value = this.digits()[index];
      }
      return;
    }
    const chars = this.value().split('');
    chars[index] = char;
    this.value.set(chars.join('').slice(0, this.length()));
    if (index < this.length() - 1) {
      this.boxes()[index + 1]?.nativeElement.focus();
    }
  }

  protected onBoxKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const chars = this.value().split('');
      if (chars[index]) {
        chars[index] = '';
        this.value.set(chars.join(''));
      } else if (index > 0) {
        event.preventDefault();
        chars[index - 1] = '';
        this.value.set(chars.join(''));
        this.boxes()[index - 1]?.nativeElement.focus();
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.boxes()[index - 1]?.nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < this.length() - 1) {
      event.preventDefault();
      this.boxes()[index + 1]?.nativeElement.focus();
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const sanitized = [...text]
      .map((char) => this.sanitize(char))
      .filter((char) => char !== '')
      .join('')
      .slice(0, this.length());
    if (!sanitized) {
      return;
    }
    this.value.set(sanitized);
    const lastIndex = Math.max(sanitized.length - 1, 0);
    this.boxes()[lastIndex]?.nativeElement.focus();
  }

  private sanitize(char: string): string {
    if (!char) {
      return '';
    }
    const pattern = this.type() === 'numeric' ? /[0-9]/ : /[a-zA-Z0-9]/;
    return pattern.test(char) ? char : '';
  }
}

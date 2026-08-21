import { Component, booleanAttribute, computed, effect, ElementRef, input, signal, viewChildren } from '@angular/core';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { ErrorMessageComponent } from '../error-message/error-message.component';

/**
 * A one-time-password input: `length` individual boxes, auto-advancing focus as you type,
 * Backspace/arrow-key navigation between boxes, and paste support (pasting a full code fills
 * every box at once). The bound value is the concatenated string, but only once the code is
 * complete -- see `tokens` below. Supports ngModel, reactive forms, and Signal Forms through
 * `BaseFormFieldControl`.
 */
@Component({
  selector: 's-otp',
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

  /**
   * What each box actually displays. Kept separate from `value` (rather than deriving it from
   * `value` by character position) because `value` only ever holds a *complete* code -- see
   * `syncValue()` -- so it can't also represent "box 2 is empty, box 3 has a digit" while you're
   * still typing. A plain array has no such problem: indexing a gap just reads back `undefined`,
   * there's nothing here that ever needs to collapse it the way `Array.prototype.join('')` would.
   */
  private readonly tokens = signal<string[]>([]);
  /** The string `syncValue()` last wrote to `value` itself -- lets the effect below tell "value
   * changed because we just completed/cleared the code" apart from "something external (a form
   * reset, Signal Forms, a plain `[(value)]` binding) just set it," so external writes resync
   * `tokens` but our own commits don't loop back and stomp on whatever's mid-edit. */
  private lastCommitted: string | null = null;

  protected readonly digits = computed(() => {
    const tokens = this.tokens();
    return this.indices().map((i) => tokens[i] ?? '');
  });

  constructor() {
    super();
    effect(() => {
      const value = this.value();
      if (value === this.lastCommitted) {
        return;
      }
      this.tokens.set([...value]);
    });
  }

  protected override emptyValue(): string {
    return '';
  }

  override writeValue(value: string): void {
    super.writeValue(value);
    // Belt-and-suspenders alongside the effect above: if a reset writes back the same string
    // `value` already holds (e.g. resetting to '' while we'd already cleared it to '' ourselves
    // mid-edit), the signal doesn't change and that effect never reruns -- this still forces the
    // boxes to visually clear, since writeValue only ever fires for a genuine external write.
    this.tokens.set([...(value ?? this.emptyValue())]);
  }

  focus(options?: FocusOptions): void {
    this.boxes()[0]?.nativeElement.focus(options);
  }

  protected override focusTarget(): HTMLElement | null {
    return this.boxes()[0]?.nativeElement ?? null;
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
    const next = [...this.tokens()];
    next[index] = char;
    this.tokens.set(next);
    this.syncValue();
    if (index < this.length() - 1) {
      this.boxes()[index + 1]?.nativeElement.focus();
    }
  }

  protected onBoxKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const tokens = this.tokens();
      if (tokens[index]) {
        const next = [...tokens];
        next[index] = '';
        this.tokens.set(next);
        this.syncValue();
      } else if (index > 0) {
        event.preventDefault();
        const next = [...tokens];
        next[index - 1] = '';
        this.tokens.set(next);
        this.syncValue();
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
    this.tokens.set([...sanitized]);
    this.syncValue();
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

  /** Pushes `tokens` out to the public `value` model only when every box is filled, and pulls
   * `value` back to empty the moment that stops being true -- so `value` is never a partial,
   * gap-containing string, only ever "" or a genuinely complete code. */
  private syncValue(): void {
    const tokens = this.tokens();
    const complete = this.indices().every((i) => !!tokens[i]);
    const next = complete ? tokens.join('').slice(0, this.length()) : this.emptyValue();
    if (next === this.value()) {
      return;
    }
    this.lastCommitted = next;
    this.value.set(next);
  }
}

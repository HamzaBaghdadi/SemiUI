import { Component, ElementRef, booleanAttribute, computed, input, viewChild } from '@angular/core';
import { InputDirective } from '@semiui/primitives/input';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { injectSemiUIIcons } from '@semiui/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

/**
 * A numeric input with optional increment/decrement buttons, min/max/step clamping, and
 * prefix/suffix text (rendered as separate elements flanking the field, not embedded in the
 * value, so parsing stays simple). Supports ngModel, reactive forms, and Signal Forms. The bound
 * value is `number | null` -- `null` for an empty field, never `NaN`.
 */
@Component({
  selector: 's-input-number',
  imports: [InputDirective, SIconComponent, ErrorMessageComponent],
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.css',
})
export class InputNumberComponent extends BaseFormFieldControl<number | null> {
  protected readonly icons = injectSemiUIIcons();
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  placeholder = input('');
  errorMessage = input('');
  min = input<number>();
  max = input<number>();
  step = input(1);
  showButtons = input(true, { transform: booleanAttribute });
  /** "vertical" stacks chevrons on the trailing edge (default); "horizontal" puts a full-height
   *  decrement button on the lead and increment on the end, like a [-] [value] [+] stepper. */
  buttons = input<'vertical' | 'horizontal'>('vertical');
  prefix = input('');
  suffix = input('');

  protected readonly displayValue = computed(() => {
    const value = this.value();
    return value === null ? '' : String(value);
  });

  protected readonly atMax = computed(() => {
    const max = this.max();
    return max !== undefined && (this.value() ?? 0) >= max;
  });

  protected readonly atMin = computed(() => {
    const min = this.min();
    return min !== undefined && (this.value() ?? 0) <= min;
  });

  protected override emptyValue(): number | null {
    return null;
  }

  focus(options?: FocusOptions): void {
    this.nativeInput()?.nativeElement.focus(options);
  }

  /** Only commits well-formed numbers as the user types; a stray "-" or trailing "." is left
   *  on-screen uncommitted until blur, which resyncs the field to the last valid value. */
  protected onInput(raw: string): void {
    if (raw.trim() === '') {
      this.value.set(null);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      this.value.set(parsed);
    }
  }

  protected onBlur(): void {
    const clamped = this.clamp(this.value());
    this.value.set(clamped);
    const el = this.nativeInput()?.nativeElement;
    if (el) {
      el.value = clamped === null ? '' : String(clamped);
    }
    this.handleBlur();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.decrement();
    }
  }

  protected increment(): void {
    this.stepBy(this.step());
  }

  protected decrement(): void {
    this.stepBy(-this.step());
  }

  private stepBy(delta: number): void {
    if (this.effectiveDisabled()) {
      return;
    }
    const current = this.value() ?? 0;
    this.value.set(this.clamp(current + delta));
    this.nativeInput()?.nativeElement.focus();
  }

  private clamp(value: number | null): number | null {
    if (value === null) {
      return null;
    }
    let result = value;
    const min = this.min();
    const max = this.max();
    if (min !== undefined) {
      result = Math.max(min, result);
    }
    if (max !== undefined) {
      result = Math.min(max, result);
    }
    return result;
  }
}

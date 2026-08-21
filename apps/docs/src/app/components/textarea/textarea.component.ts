import { Component, ElementRef, afterRenderEffect, booleanAttribute, computed, input, viewChild } from '@angular/core';
import { InputDirective } from '@semiui/primitives/input';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { ErrorMessageComponent } from '../error-message/error-message.component';

/** A multi-line text input: same form support as Text Input, plus optional auto-resize and a character counter. */
@Component({
  selector: 's-textarea',
  imports: [InputDirective, ErrorMessageComponent],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
})
export class TextareaComponent extends BaseFormFieldControl<string> {
  private readonly nativeTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('nativeTextarea');

  placeholder = input('');
  errorMessage = input('');
  rows = input(3);
  maxLength = input<number>();
  /** Grows the textarea to fit its content instead of scrolling internally. */
  autoResize = input(false, { transform: booleanAttribute });

  protected readonly characterCount = computed(() => this.value().length);

  /** Reacts to any source of value change (typing, ngModel/reactive-forms writes, Signal Forms) so the height stays correct even when the value is set programmatically. */
  private readonly autoResizeEffect = afterRenderEffect(() => {
    if (!this.autoResize()) {
      return;
    }
    this.value();
    const el = this.nativeTextarea()?.nativeElement;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  });

  protected override emptyValue(): string {
    return '';
  }

  focus(options?: FocusOptions): void {
    this.nativeTextarea()?.nativeElement.focus(options);
  }

  protected override focusTarget(): HTMLElement | null {
    return this.nativeTextarea()?.nativeElement ?? null;
  }

  protected onInput(value: string): void {
    this.value.set(value);
  }
}

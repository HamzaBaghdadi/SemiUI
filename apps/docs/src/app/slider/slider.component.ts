import { Component, ElementRef, booleanAttribute, computed, input, signal, viewChild } from '@angular/core';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export type SliderOrientation = 'horizontal' | 'vertical';

/**
 * A single-thumb range slider: drag the thumb, click anywhere on the track to jump to it, or use
 * the keyboard (arrows for one step, PageUp/PageDown for ten steps, Home/End for min/max).
 * Supports ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl`. `min`/`max`
 * are natural names for this component's own range, but they collide with Angular Signal Forms'
 * reserved `FormUiControl` contract member names -- same tradeoff Input Number already made, so
 * this component supports ngModel and reactive forms fully, but isn't demonstrated with
 * `[formField]` in the docs.
 */
@Component({
  selector: 'z-slider',
  imports: [ErrorMessageComponent],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-disabled]': 'effectiveDisabled() ? \'\' : null',
  },
})
export class SliderComponent extends BaseFormFieldControl<number | null> {
  private readonly track = viewChild<ElementRef<HTMLDivElement>>('track');

  min = input(0);
  max = input(100);
  step = input(1);
  orientation = input<SliderOrientation>('horizontal');
  errorMessage = input('');
  /** Renders a tick mark at every step along the track. */
  showTicks = input(false, { transform: booleanAttribute });
  /** Shows a floating value bubble above the thumb while dragging or focused. */
  showValueBubble = input(true, { transform: booleanAttribute });
  /** Formats the displayed value, e.g. to add units or currency. */
  valueFormatter = input<(value: number) => string>((value) => String(value));

  protected readonly isDragging = signal(false);
  protected readonly isFocused = signal(false);

  protected readonly clampedValue = computed(() => this.clamp(this.value() ?? this.min()));
  protected readonly percent = computed(() => {
    const range = this.max() - this.min();
    return range <= 0 ? 0 : ((this.clampedValue() - this.min()) / range) * 100;
  });

  protected readonly tickPercents = computed(() => {
    if (!this.showTicks()) {
      return [];
    }
    const min = this.min();
    const max = this.max();
    const step = this.step();
    if (step <= 0 || max <= min) {
      return [];
    }
    const count = Math.floor((max - min) / step);
    return Array.from({ length: count + 1 }, (_, i) => (Math.min(i * step, max - min) / (max - min)) * 100);
  });

  protected override emptyValue(): number | null {
    return null;
  }

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.effectiveDisabled()) {
      return;
    }
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.isDragging.set(true);
    this.updateFromPointer(event);
  }

  protected onTrackPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }
    this.updateFromPointer(event);
  }

  protected onTrackPointerUp(): void {
    if (!this.isDragging()) {
      return;
    }
    this.isDragging.set(false);
    this.handleBlur();
  }

  private updateFromPointer(event: PointerEvent): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) {
      return;
    }
    const rect = trackEl.getBoundingClientRect();
    const vertical = this.orientation() === 'vertical';
    let fraction = vertical ? 1 - (event.clientY - rect.top) / rect.height : (event.clientX - rect.left) / rect.width;
    fraction = Math.min(1, Math.max(0, fraction));
    const raw = this.min() + fraction * (this.max() - this.min());
    this.value.set(this.clamp(raw));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled()) {
      return;
    }
    const step = this.step();
    const bigStep = step * 10;
    const current = this.clampedValue();
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - step;
        break;
      case 'PageUp':
        next = current + bigStep;
        break;
      case 'PageDown':
        next = current - bigStep;
        break;
      case 'Home':
        next = this.min();
        break;
      case 'End':
        next = this.max();
        break;
    }
    if (next !== null) {
      event.preventDefault();
      this.value.set(this.clamp(next));
    }
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.handleBlur();
  }

  private clamp(value: number): number {
    const stepped = this.snapToStep(value);
    return Math.min(this.max(), Math.max(this.min(), stepped));
  }

  private snapToStep(value: number): number {
    const step = this.step();
    if (step <= 0) {
      return value;
    }
    const min = this.min();
    return Math.round((value - min) / step) * step + min;
  }
}

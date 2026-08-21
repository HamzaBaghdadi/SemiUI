import { Component, ElementRef, booleanAttribute, computed, inject, input, signal, viewChild } from '@angular/core';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
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
  selector: 's-slider',
  imports: [ErrorMessageComponent],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-disabled]': 'effectiveDisabled() ? \'\' : null',
  },
})
export class SliderComponent extends BaseFormFieldControl<number | null> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly track = viewChild<ElementRef<HTMLDivElement>>('track');
  private readonly thumb = viewChild<ElementRef<HTMLDivElement>>('thumb');

  min = input(0);
  max = input(100);
  step = input(1);
  orientation = input<SliderOrientation>('horizontal');
  /** Accessible name for the thumb, e.g. when no visible label is associated with the slider. */
  ariaLabel = input<string>();
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

  focus(options?: FocusOptions): void {
    this.thumb()?.nativeElement.focus(options);
  }

  protected override focusTarget(): HTMLElement | null {
    return this.thumb()?.nativeElement ?? null;
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
    let fraction: number;
    if (vertical) {
      fraction = 1 - (event.clientY - rect.top) / rect.height;
    } else {
      fraction = (event.clientX - rect.left) / rect.width;
      // The thumb/fill now render from inset-inline-start (0% sits at the physical right edge
      // under RTL, matching native <input type="range">), so a click's physical-left-relative
      // fraction has to invert to land on the same value that position now represents.
      if (trackEl.matches(':dir(rtl)')) {
        fraction = 1 - fraction;
      }
    }
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
    // Only Left/Right flip -- they move the thumb toward whichever value now sits at that
    // physical side under RTL (min moves to the right, matching native <input type="range">).
    // Up/Down stay fixed: "up" always means "more", independent of horizontal text direction.
    const isRtl = this.orientation() === 'horizontal' && this.elementRef.nativeElement.matches(':dir(rtl)');
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        next = isRtl ? current - step : current + step;
        break;
      case 'ArrowLeft':
        next = isRtl ? current + step : current - step;
        break;
      case 'ArrowUp':
        next = current + step;
        break;
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

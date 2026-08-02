import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { Hsv, hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from './color';

const DEFAULT_PRESETS: readonly string[] = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#64748b',
  '#000000',
  '#ffffff',
];

const PANEL_SPACE_ESTIMATE_PX = 380;

/**
 * A hex color picker: a saturation/value square, a hue slider, a typeable hex field, and preset
 * swatches. Trigger + popover panel by default, or `inline` to render the panel directly with no
 * trigger. Supports ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl` --
 * the bound value is a `#rrggbb` hex string (no alpha channel).
 *
 * Internally tracks HSV rather than round-tripping every drag through hex: converting hex back to
 * HSV on every interaction loses the hue whenever saturation hits 0 (achromatic colors have no
 * well-defined hue), which reads as the hue slider "snapping" back while dragging through gray.
 * Only a genuinely external value change (ngModel push, preset click from outside, etc.) re-derives
 * HSV from hex; the picker's own writes are recognized and skipped.
 */
@Component({
  selector: 'z-color-picker',
  imports: [ErrorMessageComponent, NgTemplateOutlet],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
    '[attr.data-inline]': 'inline() ? \'\' : null',
  },
})
export class ColorPickerComponent extends BaseFormFieldControl<string | null> {
  private readonly triggerButton = viewChild<ElementRef<HTMLButtonElement>>('triggerButton');
  private readonly svArea = viewChild<ElementRef<HTMLDivElement>>('svArea');
  private readonly hueTrack = viewChild<ElementRef<HTMLDivElement>>('hueTrack');
  private readonly hexInputEl = viewChild<ElementRef<HTMLInputElement>>('hexInputEl');
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  inline = input(false, { transform: booleanAttribute });
  presets = input<readonly string[]>(DEFAULT_PRESETS);
  placeholder = input('Pick a color');
  errorMessage = input('');

  protected readonly open = signal(false);
  protected readonly panelPlacement = signal<'top' | 'bottom'>('bottom');
  protected readonly hsv = signal<Hsv>({ h: 0, s: 0, v: 100 });
  protected readonly hexInput = signal('');
  protected readonly isDraggingSv = signal(false);
  protected readonly isDraggingHue = signal(false);

  protected readonly rgb = computed(() => hsvToRgb(this.hsv()));
  protected readonly hueColor = computed(() => rgbToHex(hsvToRgb({ h: this.hsv().h, s: 100, v: 100 })));
  protected readonly thumbColor = computed(() => rgbToHex(this.rgb()));
  /** The hex field displays without the leading "#" -- that's shown as a separate static prefix character. */
  protected readonly hexInputDisplay = computed(() => this.hexInput().replace(/^#/, ''));

  private lastEmittedHex: string | null | undefined = undefined;

  private readonly syncFromExternalValue = effect(() => {
    const value = this.value();
    if (value === this.lastEmittedHex) {
      return;
    }
    const parsed = value ? hexToRgb(value) : null;
    if (parsed) {
      this.hsv.set(rgbToHsv(parsed.r, parsed.g, parsed.b));
      this.hexInput.set(value as string);
    } else {
      this.hexInput.set('');
    }
  });

  protected override emptyValue(): string | null {
    return null;
  }

  protected toggle(): void {
    if (this.effectiveDisabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected openPanel(): void {
    this.open.set(true);
    this.updatePlacement();
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.handleBlur();
  }

  protected onSvPointerDown(event: PointerEvent): void {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.isDraggingSv.set(true);
    this.updateFromSvPointer(event);
  }

  protected onSvPointerMove(event: PointerEvent): void {
    if (this.isDraggingSv()) {
      this.updateFromSvPointer(event);
    }
  }

  protected onSvPointerUp(): void {
    this.isDraggingSv.set(false);
  }

  protected onHuePointerDown(event: PointerEvent): void {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.isDraggingHue.set(true);
    this.updateFromHuePointer(event);
  }

  protected onHuePointerMove(event: PointerEvent): void {
    if (this.isDraggingHue()) {
      this.updateFromHuePointer(event);
    }
  }

  protected onHuePointerUp(): void {
    this.isDraggingHue.set(false);
  }

  protected onHexInputChange(raw: string): void {
    this.hexInput.set(raw);
  }

  protected onHexInputCommit(): void {
    const parsed = hexToRgb(this.hexInput());
    if (parsed) {
      this.applyHsv(rgbToHsv(parsed.r, parsed.g, parsed.b));
    } else {
      this.hexInput.set(this.value() ?? '');
    }
  }

  protected selectPreset(hex: string): void {
    if (this.effectiveDisabled()) {
      return;
    }
    const parsed = hexToRgb(hex);
    if (parsed) {
      this.applyHsv(rgbToHsv(parsed.r, parsed.g, parsed.b));
    }
  }

  private applyHsv(hsv: Hsv): void {
    this.hsv.set(hsv);
    const hex = rgbToHex(hsvToRgb(hsv));
    this.lastEmittedHex = hex;
    this.value.set(hex);
    this.hexInput.set(hex);
  }

  private updateFromSvPointer(event: PointerEvent): void {
    const area = this.svArea()?.nativeElement;
    if (!area) {
      return;
    }
    const rect = area.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    this.applyHsv({ ...this.hsv(), s: x * 100, v: (1 - y) * 100 });
  }

  private updateFromHuePointer(event: PointerEvent): void {
    const track = this.hueTrack()?.nativeElement;
    if (!track) {
      return;
    }
    const rect = track.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.applyHsv({ ...this.hsv(), h: fraction * 360 });
  }

  private updatePlacement(): void {
    const trigger = this.triggerButton()?.nativeElement;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    this.panelPlacement.set(spaceBelow < PANEL_SPACE_ESTIMATE_PX && spaceAbove > spaceBelow ? 'top' : 'bottom');
  }

  private hasFocusedThisOpen = false;

  /**
   * Focuses the hex field once when the popover opens -- not the panel container, and not on
   * every re-render while it stays open. An unguarded afterRenderEffect calling .focus() on any
   * dependency change would yank focus away from the hex input mid-keystroke, since typing itself
   * changes hexInput() and triggers another render. Never runs for `inline`, which shouldn't
   * steal page focus just by existing on the page.
   */
  private readonly focusHexInputOnOpen = afterRenderEffect(() => {
    if (this.inline()) {
      return;
    }
    if (!this.open()) {
      this.hasFocusedThisOpen = false;
      return;
    }
    if (this.hasFocusedThisOpen) {
      return;
    }
    this.hasFocusedThisOpen = true;
    this.hexInputEl()?.nativeElement.focus();
  });

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (this.open()) {
      this.updatePlacement();
    }
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (this.open()) {
      this.updatePlacement();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    if (this.open() && !this.inline()) {
      this.close();
      this.triggerButton()?.nativeElement.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.inline() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}

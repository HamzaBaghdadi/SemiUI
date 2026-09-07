import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
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
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
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
  selector: 's-color-picker',
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
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  inline = input(false, { transform: booleanAttribute });
  presets = input<readonly string[]>(DEFAULT_PRESETS);
  /** Hides the preset swatches section entirely. Passing an empty `presets` array does this too -- this is the more discoverable/explicit way to do it. */
  showPresets = input(true, { transform: booleanAttribute });
  /** Hides the hex text next to the swatch in the trigger button, leaving just the color swatch visible. */
  showValueText = input(true, { transform: booleanAttribute });
  placeholder = input('Pick a color');
  errorMessage = input('');
  /** Moves the panel to a direct child of `document.body`, escaping any ancestor's `overflow: hidden` clipping or `transform`/`filter` stacking context -- what a Color Picker inside a Dialog, a Drawer or a scrollable card needs so the panel isn't cut off. No effect when `inline`. */
  appendTo = input<'body' | null>(null);
  /** Closes the panel when a scroll container under the trigger scrolls, instead of repositioning
   * the panel to follow it -- the same option Popover exposes. Applies to a nested `overflow-y: auto`
   * ancestor as much as to the page itself. */
  closeOnScroll = input(false, { transform: booleanAttribute });

  protected readonly open = signal(false);
  protected readonly panelPlacement = signal<'top' | 'bottom'>('bottom');
  protected readonly fixedPosition = signal({ top: 0, left: 0 });
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

  focus(options?: FocusOptions): void {
    this.focusTarget()?.focus(options);
  }

  /** `inline` has no trigger button -- the hex field is the closest thing to a natural focus
   * target, since it's the only always-visible interactive control that isn't a drag surface. */
  protected override focusTarget(): HTMLElement | null {
    return this.inline() ? (this.hexInputEl()?.nativeElement ?? null) : (this.triggerButton()?.nativeElement ?? null);
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

  /**
   * Physically relocates the panel to `document.body` (once) and pins it with `position: fixed`
   * pixel coordinates measured off the trigger, since it can no longer be positioned relative to
   * its host once it isn't a descendant of it. No width is written: the panel's width is the
   * saturation/value area's own token, not the trigger's.
   */
  private positionAppendedPanel(): void {
    const trigger = this.triggerButton()?.nativeElement;
    const panel = this.panel()?.nativeElement;
    if (!trigger || !panel) {
      return;
    }
    if (panel.parentElement !== document.body) {
      document.body.appendChild(panel);
    }
    const rect = trigger.getBoundingClientRect();
    const gap = 4;
    const top =
      this.panelPlacement() === 'top' ? rect.top - gap - panel.getBoundingClientRect().height : rect.bottom + gap;
    this.fixedPosition.set({ top, left: rect.left });
  }

  /** Moves the panel to `document.body` and pins it by pixel coordinates once it's rendered. */
  private readonly appendToBodyEffect = afterRenderEffect(() => {
    if (this.open() && this.appendTo() === 'body') {
      this.positionAppendedPanel();
    }
  });

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

  /**
   * `scroll` events don't bubble, so `@HostListener('window:scroll')` only ever hears the page
   * itself scrolling -- put this control inside a `overflow-y: auto` div, a scrollable dialog
   * body or a virtualised list and none of the repositioning below runs, which leaves the panel
   * stranded where the trigger used to be. A capture-phase listener on the document hears all of
   * them: a scroll event still passes through the document on its way down to the element that
   * scrolled, even though it never bubbles back up.
   */
  constructor() {
    super();

    const onScroll = (event: Event) => this.onAnyScroll(event);
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    this.destroyRef.onDestroy(() => document.removeEventListener('scroll', onScroll, { capture: true }));
  }

  protected onAnyScroll(event: Event): void {
    if (!this.open()) {
      return;
    }
    // Only scrollers that actually move the anchor matter; a scroll somewhere else on the page
    // leaves it exactly where it was. For a page scroll the event target is `document`, which
    // contains everything, so that case still passes.
    const anchor = this.triggerButton()?.nativeElement;
    const target = event.target as Node;
    if (!anchor || !target.contains(anchor)) {
      return;
    }
    if (this.closeOnScroll()) {
      this.close();
      return;
    }
    this.updatePlacement();
    if (this.appendTo() === 'body') {
      this.positionAppendedPanel();
    }
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (this.open()) {
      this.updatePlacement();
      if (this.appendTo() === 'body') {
        this.positionAppendedPanel();
      }
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    if (this.open() && !this.inline()) {
      this.close();
      this.triggerButton()?.nativeElement.focus();
    }
  }

  /**
   * The panel is tested separately from the host rather than relying on `host.contains()` alone:
   * with `appendTo="body"` the panel is a child of `<body>`, not a descendant of this component,
   * so every click inside it (the saturation area, the hue track, a preset, the hex field) would
   * read as an outside click and close the picker out from under the interaction.
   */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open() || this.inline()) {
      return;
    }
    const target = event.target as Node;
    if (this.elementRef.nativeElement.contains(target) || this.panel()?.nativeElement.contains(target)) {
      return;
    }
    this.close();
  }
}

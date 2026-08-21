import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  TemplateRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { InputDirective } from '@semiui/primitives/input';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { injectSemiUIIcons } from '@semiui/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export interface AutoCompleteOptionContext<T> {
  $implicit: T;
  index: number;
  query: string;
}

/** How far below (or above) the input the panel needs to fit before it flips sides. */
const PANEL_SPACE_ESTIMATE_PX = 320;

let nextAutoCompleteId = 0;

/**
 * A free-text input with a filtered suggestions panel: unlike Select, the bound `value` is
 * whatever the user has typed, not constrained to one of `options` -- picking a suggestion just
 * fills the text in. Supports ngModel, reactive forms, and Signal Forms through
 * `BaseFormFieldControl`. `options` is filtered client-side by substring match against
 * `optionLabel`; for async/server-driven suggestions, ignore the built-in filtering by feeding
 * `options` from the `(search)` output's query instead of a static array.
 */
@Component({
  selector: 's-auto-complete',
  imports: [InputDirective, SIconComponent, NgTemplateOutlet, ErrorMessageComponent],
  templateUrl: './auto-complete.component.html',
  styleUrl: './auto-complete.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
  },
})
export class AutoCompleteComponent<TOption = unknown> extends BaseFormFieldControl<string> {
  protected readonly icons = injectSemiUIIcons();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');
  private readonly panel = viewChild<ElementRef<HTMLUListElement>>('panel');

  options = input<readonly TOption[]>([]);
  /** Property to read the display label (and, on selection, the filled-in text) from, when options are objects. Omit for primitive (string) options. */
  optionLabel = input<string>();
  placeholder = input('');
  errorMessage = input('');
  /** Shows a clear ("x") affordance when there's text. */
  clearable = input(true, { transform: booleanAttribute });
  /** Minimum characters typed before the panel (and filtering) activates. */
  minChars = input(1);
  emptyMessage = input('No results found');
  /** Shows a spinner and disables interaction, for async suggestion loading. */
  loading = input(false, { transform: booleanAttribute });
  /** Moves the panel to a direct child of `document.body`, escaping any ancestor's `overflow: hidden` clipping or `transform`/`filter` stacking context. */
  appendTo = input<'body' | null>(null);

  /** Emitted with the current query on every keystroke -- feed this into an async lookup and rebind `options` with the results for server-driven suggestions. */
  search = output<string>();
  /** Emitted with the full option object when a suggestion is picked (vs. free-typed text the user never selected from the list). */
  optionSelected = output<TOption>();

  /** Custom rendering for each row in the suggestions panel. Context: `AutoCompleteOptionContext<TOption>`. */
  protected optionTemplate = contentChild<unknown, TemplateRef<AutoCompleteOptionContext<TOption>>>('option', {
    read: TemplateRef,
  });

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly panelPlacement = signal<'top' | 'bottom'>('bottom');
  protected readonly fixedPosition = signal({ top: 0, left: 0, width: 0 });
  protected readonly listboxId = `s-auto-complete-listbox-${nextAutoCompleteId++}`;
  protected readonly activeOptionId = computed(() =>
    this.open() && this.activeIndex() >= 0 ? `${this.listboxId}-option-${this.activeIndex()}` : null,
  );

  protected readonly filteredOptions = computed<readonly TOption[]>(() => {
    const query = this.value().trim().toLowerCase();
    if (query.length < this.minChars()) {
      return [];
    }
    return this.options().filter((option) => this.labelFor(option).toLowerCase().includes(query));
  });

  protected readonly showClear = computed(
    () => this.clearable() && !this.effectiveDisabled() && !this.loading() && this.value().length > 0,
  );

  /** Moves the panel to `document.body` and positions it by pixel coordinates once it exists in the DOM. */
  private readonly appendToBodyEffect = afterRenderEffect(() => {
    if (this.open() && this.appendTo() === 'body') {
      this.positionAppendedPanel();
    }
  });

  protected override emptyValue(): string {
    return '';
  }

  focus(options?: FocusOptions): void {
    this.nativeInput()?.nativeElement.focus(options);
  }

  protected override focusTarget(): HTMLElement | null {
    return this.nativeInput()?.nativeElement ?? null;
  }

  protected labelFor(option: TOption): string {
    const key = this.optionLabel();
    if (!key) {
      return String(option);
    }
    return String((option as Record<string, unknown>)[key]);
  }

  protected onInput(text: string): void {
    this.value.set(text);
    this.activeIndex.set(-1);
    this.search.emit(text);
    if (this.effectiveDisabled() || this.loading()) {
      return;
    }
    if (text.trim().length >= this.minChars()) {
      this.open.set(true);
      this.updatePlacement();
    } else {
      this.open.set(false);
    }
  }

  protected onFocus(): void {
    if (this.effectiveDisabled() || this.loading()) {
      return;
    }
    if (this.value().trim().length >= this.minChars()) {
      this.open.set(true);
      this.updatePlacement();
    }
  }

  protected onInputBlur(): void {
    this.close();
    this.handleBlur();
  }

  protected selectOption(option: TOption): void {
    this.value.set(this.labelFor(option));
    this.optionSelected.emit(option);
    this.close();
    this.nativeInput()?.nativeElement.focus();
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.effectiveDisabled()) {
      return;
    }
    this.value.set('');
    this.search.emit('');
    this.close();
    this.nativeInput()?.nativeElement.focus();
  }

  protected close(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  /**
   * Handles keydown on the native input. `mousedown` on each option (see the template) prevents
   * the input from blurring before a click registers, so focus -- and this handler -- stays live
   * across a pointer selection too, not just keyboard use.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled() || this.loading()) {
      return;
    }
    const options = this.filteredOptions();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open() && this.value().trim().length >= this.minChars()) {
          this.open.set(true);
          this.updatePlacement();
        }
        this.activeIndex.update((index) => Math.min(index + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((index) => Math.max(index - 1, 0));
        break;
      case 'Enter':
        if (this.open() && this.activeIndex() >= 0) {
          event.preventDefault();
          const option = options[this.activeIndex()];
          if (option) {
            this.selectOption(option);
          }
        }
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  /**
   * Picks which side of the input the panel opens on, based on available viewport space -- bottom
   * by default, flipping to top when there isn't enough room below but there is above.
   */
  private updatePlacement(): void {
    const anchor = this.nativeInput()?.nativeElement;
    if (!anchor) {
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    this.panelPlacement.set(spaceBelow < PANEL_SPACE_ESTIMATE_PX && spaceAbove > spaceBelow ? 'top' : 'bottom');
  }

  /**
   * Physically relocates the panel to `document.body` (once) and pins it with `position: fixed`
   * pixel coordinates computed from the input's rect, since it can no longer rely on CSS
   * relative-to-host positioning once it's no longer a descendant of the input's host.
   */
  private positionAppendedPanel(): void {
    const anchor = this.nativeInput()?.nativeElement;
    const panel = this.panel()?.nativeElement;
    if (!anchor || !panel) {
      return;
    }
    if (panel.parentElement !== document.body) {
      document.body.appendChild(panel);
    }
    const rect = anchor.getBoundingClientRect();
    const gap = 4;
    const top =
      this.panelPlacement() === 'top' ? rect.top - gap - panel.getBoundingClientRect().height : rect.bottom + gap;
    this.fixedPosition.set({ top, left: rect.left, width: rect.width });
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (this.open()) {
      this.updatePlacement();
      if (this.appendTo() === 'body') {
        this.positionAppendedPanel();
      }
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

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}

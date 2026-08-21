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
  signal,
  viewChild,
} from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { injectSemiUIIcons } from '@semiui/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export interface SelectOptionContext<T> {
  $implicit: T;
  index: number;
  selected: boolean;
}

/** How far below (or above) the trigger the panel needs to fit before it flips sides. */
const PANEL_SPACE_ESTIMATE_PX = 320;

let nextSelectId = 0;

/**
 * A listbox-based select: works with plain values or option objects (via `optionLabel` /
 * `optionValue`), and supports ngModel, reactive forms, and Signal Forms through
 * `BaseFormFieldControl`. Custom rendering via named `<ng-template>` slots -- see the
 * `#selected` / `#option` / `#icon` / `#header` / `#footer` template variables referenced below.
 */
@Component({
  selector: 's-select',
  imports: [SIconComponent, NgTemplateOutlet, ErrorMessageComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
  },
})
export class SelectComponent<TOption = unknown> extends BaseFormFieldControl<unknown> {
  protected readonly icons = injectSemiUIIcons();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly triggerButton = viewChild<ElementRef<HTMLButtonElement>>('triggerButton');
  private readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');

  options = input<readonly TOption[]>([]);
  /** Property to read the display label from, when options are objects. Omit for primitive options. */
  optionLabel = input<string>();
  /** Property to read the bound value from, when options are objects. Omit to use the whole option as the value. */
  optionValue = input<string>();
  placeholder = input('');
  errorMessage = input('');
  /** Shows a clear ("x") affordance when a value is selected. Keyboard users can also press Backspace/Delete on the trigger. */
  clearable = input(true, { transform: booleanAttribute });
  /** Shows a search box in the panel that filters options by label as you type. */
  filterable = input(true, { transform: booleanAttribute });
  filterPlaceholder = input('Search...');
  emptyMessage = input('No results found');
  /** Shows a spinner in place of the chevron and disables interaction, for async option loading. */
  loading = input(false, { transform: booleanAttribute });
  /** Moves the panel to a direct child of `document.body`, escaping any ancestor's `overflow: hidden` clipping or `transform`/`filter` stacking context. */
  appendTo = input<'body' | null>(null);

  /** Custom rendering for the selected value shown in the closed trigger. Context: the selected option, or undefined. */
  protected selectedTemplate = contentChild<unknown, TemplateRef<{ $implicit: TOption | undefined }>>('selected', {
    read: TemplateRef,
  });
  /** Custom rendering for each option in the open list. Context: `SelectOptionContext<TOption>`. */
  protected optionTemplate = contentChild<unknown, TemplateRef<SelectOptionContext<TOption>>>('option', {
    read: TemplateRef,
  });
  /** Custom trigger icon, replacing the default chevron. */
  protected iconTemplate = contentChild<unknown, TemplateRef<unknown>>('icon', { read: TemplateRef });
  /** Rendered above the option list. */
  protected headerTemplate = contentChild<unknown, TemplateRef<unknown>>('header', { read: TemplateRef });
  /** Rendered below the option list. */
  protected footerTemplate = contentChild<unknown, TemplateRef<unknown>>('footer', { read: TemplateRef });

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly filterText = signal('');
  protected readonly panelPlacement = signal<'top' | 'bottom'>('bottom');
  protected readonly fixedPosition = signal({ top: 0, left: 0, width: 0 });
  protected readonly listboxId = `s-select-listbox-${nextSelectId++}`;
  protected readonly activeOptionId = computed(() =>
    this.open() && this.activeIndex() >= 0 ? `${this.listboxId}-option-${this.activeIndex()}` : null,
  );

  protected readonly selectedOption = computed<TOption | undefined>(() => {
    const value = this.value();
    // `== null` (loose) on purpose -- catches both null (the empty value, see emptyValue) and a
    // stray undefined from an external write, without needing two comparisons.
    if (value == null) {
      return undefined;
    }
    return this.options().find((option) => this.resolveValue(option) === value);
  });

  protected readonly selectedLabel = computed(() => {
    const option = this.selectedOption();
    return option === undefined ? '' : this.labelFor(option);
  });

  protected readonly showClear = computed(
    () => this.clearable() && !this.effectiveDisabled() && !this.loading() && this.selectedOption() !== undefined,
  );

  protected readonly filteredOptions = computed<readonly TOption[]>(() => {
    const query = this.filterText().trim().toLowerCase();
    const all = this.options();
    if (!this.filterable() || !query) {
      return all;
    }
    return all.filter((option) => this.labelFor(option).toLowerCase().includes(query));
  });

  /** Moves focus into the filter box whenever the panel opens (filterable selects only). */
  private readonly focusFilterOnOpen = afterRenderEffect(() => {
    if (this.open() && this.filterable()) {
      this.filterInput()?.nativeElement.focus();
    }
  });

  /** Moves the panel to `document.body` and positions it by pixel coordinates once it exists in the DOM. */
  private readonly appendToBodyEffect = afterRenderEffect(() => {
    if (this.open() && this.appendTo() === 'body') {
      this.positionAppendedPanel();
    }
  });

  /**
   * `null`, not `undefined` -- with Signal Forms, writing `undefined` into the bound model deletes
   * that property from the model object, which orphans the field node (NG01902 "Orphan field") and
   * permanently breaks the view's reactive graph: every later read throws and the DOM silently
   * stops updating. `null` keeps the property present, so the field survives being cleared.
   */
  protected override emptyValue(): unknown {
    return null;
  }

  focus(options?: FocusOptions): void {
    this.triggerButton()?.nativeElement.focus(options);
  }

  protected override focusTarget(): HTMLElement | null {
    return this.triggerButton()?.nativeElement ?? null;
  }

  protected labelFor(option: TOption): string {
    const key = this.optionLabel();
    if (!key) {
      return String(option);
    }
    return String((option as Record<string, unknown>)[key]);
  }

  private resolveValue(option: TOption): unknown {
    const key = this.optionValue();
    return key ? (option as Record<string, unknown>)[key] : option;
  }

  protected toggle(): void {
    if (this.effectiveDisabled() || this.loading()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openList();
    }
  }

  protected openList(): void {
    this.open.set(true);
    this.filterText.set('');
    const currentIndex = this.options().findIndex((option) => option === this.selectedOption());
    this.activeIndex.set(currentIndex >= 0 ? currentIndex : 0);
    this.updatePlacement();
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.handleBlur();
  }

  protected selectOption(option: TOption): void {
    this.value.set(this.resolveValue(option));
    this.close();
    this.triggerButton()?.nativeElement.focus();
  }

  protected onFilterInput(value: string): void {
    this.filterText.set(value);
    this.activeIndex.set(0);
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.effectiveDisabled()) {
      return;
    }
    this.clearValue();
  }

  private clearValue(): void {
    this.value.set(this.emptyValue());
    this.close();
    this.triggerButton()?.nativeElement.focus();
  }

  /**
   * Handles keydown on the trigger button. While the panel is open and filtering is enabled,
   * focus has moved into the filter box (see `onFilterKeydown`) so only the closed-state branch
   * below is ever reached; for non-filterable selects, focus stays on the trigger throughout
   * (the standard ARIA "combobox with listbox popup" pattern) and this also drives navigation.
   */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled() || this.loading()) {
      return;
    }

    if (!this.open()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.openList();
        return;
      }
      if ((event.key === 'Backspace' || event.key === 'Delete') && this.clearable() && this.selectedOption() !== undefined) {
        event.preventDefault();
        this.clearValue();
      }
      return;
    }

    this.handleListNavigation(event, { allowSpaceToSelect: true });
  }

  /** Handles keydown on the filter box: same navigation as the trigger, but Space types normally. */
  protected onFilterKeydown(event: KeyboardEvent): void {
    this.handleListNavigation(event, { allowSpaceToSelect: false });
  }

  private handleListNavigation(event: KeyboardEvent, opts: { allowSpaceToSelect: boolean }): void {
    const options = this.filteredOptions();
    const count = options.length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((index) => Math.min(index + 1, count - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((index) => Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(count - 1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectActive(options);
        break;
      case ' ':
        if (opts.allowSpaceToSelect) {
          event.preventDefault();
          this.selectActive(options);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        this.triggerButton()?.nativeElement.focus();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  private selectActive(options: readonly TOption[]): void {
    const option = options[this.activeIndex()];
    if (option !== undefined) {
      this.selectOption(option);
    }
  }

  /**
   * Picks which side of the trigger the panel opens on, based on available viewport space --
   * bottom by default, flipping to top when there isn't enough room below but there is above.
   * Known limitation: this only accounts for the viewport, not clipping by an `overflow: hidden`
   * ancestor scroll container (that needs real portal/overlay infrastructure).
   */
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
   * pixel coordinates computed from the trigger's rect, since it can no longer rely on CSS
   * relative-to-host positioning once it's no longer a descendant of the trigger's host.
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

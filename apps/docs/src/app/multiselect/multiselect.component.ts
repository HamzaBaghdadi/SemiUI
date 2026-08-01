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
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { injectZaytoonIcons } from '@zaytoon/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export interface MultiselectOptionContext<T> {
  $implicit: T;
  index: number;
  selected: boolean;
}

const PANEL_SPACE_ESTIMATE_PX = 320;

let nextMultiselectId = 0;

/**
 * A multi-select listbox: same options/optionLabel/optionValue shape, search/filter, clear,
 * viewport-aware placement, and animated panel as Select, but the bound value is an array and
 * the panel stays open across selections (checkbox-style rows) unless `closeOnSelect` is set.
 * Supports ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl`.
 */
@Component({
  selector: 'z-multiselect',
  imports: [ZIconComponent, NgTemplateOutlet, ErrorMessageComponent],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
  },
})
export class MultiselectComponent<TOption = unknown> extends BaseFormFieldControl<unknown[]> {
  protected readonly icons = injectZaytoonIcons();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly triggerButton = viewChild<ElementRef<HTMLButtonElement>>('triggerButton');
  private readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');

  options = input<readonly TOption[]>([]);
  optionLabel = input<string>();
  optionValue = input<string>();
  placeholder = input('');
  errorMessage = input('');
  clearable = input(true, { transform: booleanAttribute });
  filterable = input(true, { transform: booleanAttribute });
  filterPlaceholder = input('Search...');
  emptyMessage = input('No results found');
  /** Closes the panel after each selection, instead of staying open for picking more. */
  closeOnSelect = input(false, { transform: booleanAttribute });
  /** Shows Select all / Clear all actions above the option list. */
  showSelectAll = input(true, { transform: booleanAttribute });
  /** Once more than this many items are selected, the trigger shows "N selected" instead of chips. */
  maxChipsDisplay = input(3);

  protected selectedTemplate = contentChild<unknown, TemplateRef<{ $implicit: TOption[] }>>('selected', {
    read: TemplateRef,
  });
  protected optionTemplate = contentChild<unknown, TemplateRef<MultiselectOptionContext<TOption>>>('option', {
    read: TemplateRef,
  });
  protected iconTemplate = contentChild<unknown, TemplateRef<unknown>>('icon', { read: TemplateRef });
  protected headerTemplate = contentChild<unknown, TemplateRef<unknown>>('header', { read: TemplateRef });
  protected footerTemplate = contentChild<unknown, TemplateRef<unknown>>('footer', { read: TemplateRef });

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly filterText = signal('');
  protected readonly panelPlacement = signal<'top' | 'bottom'>('bottom');
  protected readonly listboxId = `z-multiselect-listbox-${nextMultiselectId++}`;
  protected readonly activeOptionId = computed(() =>
    this.open() && this.activeIndex() >= 0 ? `${this.listboxId}-option-${this.activeIndex()}` : null,
  );

  protected readonly selectedOptions = computed<TOption[]>(() => {
    const values = this.value();
    return this.options().filter((option) => values.includes(this.resolveValue(option)));
  });

  protected readonly showClear = computed(() => this.clearable() && !this.effectiveDisabled() && this.value().length > 0);

  protected readonly filteredOptions = computed<readonly TOption[]>(() => {
    const query = this.filterText().trim().toLowerCase();
    const all = this.options();
    if (!this.filterable() || !query) {
      return all;
    }
    return all.filter((option) => this.labelFor(option).toLowerCase().includes(query));
  });

  private readonly focusFilterOnOpen = afterRenderEffect(() => {
    if (this.open() && this.filterable()) {
      this.filterInput()?.nativeElement.focus();
    }
  });

  protected override emptyValue(): unknown[] {
    return [];
  }

  focus(options?: FocusOptions): void {
    this.triggerButton()?.nativeElement.focus(options);
  }

  protected labelFor(option: TOption): string {
    const key = this.optionLabel();
    if (!key) {
      return String(option);
    }
    return String((option as Record<string, unknown>)[key]);
  }

  protected isSelected(option: TOption): boolean {
    return this.value().includes(this.resolveValue(option));
  }

  private resolveValue(option: TOption): unknown {
    const key = this.optionValue();
    return key ? (option as Record<string, unknown>)[key] : option;
  }

  protected toggle(): void {
    if (this.effectiveDisabled()) {
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
    this.activeIndex.set(0);
    this.updatePlacement();
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.handleBlur();
  }

  protected toggleOption(option: TOption): void {
    if (this.effectiveDisabled()) {
      return;
    }
    const val = this.resolveValue(option);
    const current = this.value();
    this.value.set(current.includes(val) ? current.filter((v) => v !== val) : [...current, val]);
    if (this.closeOnSelect()) {
      this.close();
      this.triggerButton()?.nativeElement.focus();
    } else if (this.filterable()) {
      // Clicking a (deliberately non-focusable) option blurs the filter input in real browsers --
      // refocus it so the panel staying open for more picks doesn't strand keyboard/typing input.
      this.filterInput()?.nativeElement.focus();
    }
  }

  protected selectAll(): void {
    if (this.effectiveDisabled()) {
      return;
    }
    const visibleValues = this.filteredOptions().map((option) => this.resolveValue(option));
    this.value.set([...new Set([...this.value(), ...visibleValues])]);
    this.refocusFilterIfOpen();
  }

  protected clearAll(event?: MouseEvent): void {
    event?.stopPropagation();
    if (this.effectiveDisabled()) {
      return;
    }
    this.value.set([]);
    this.refocusFilterIfOpen();
  }

  private refocusFilterIfOpen(): void {
    if (this.open() && this.filterable()) {
      this.filterInput()?.nativeElement.focus();
    }
  }

  protected onFilterInput(value: string): void {
    this.filterText.set(value);
    this.activeIndex.set(0);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled()) {
      return;
    }
    if (!this.open()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.openList();
      }
      return;
    }
    this.handleListNavigation(event, { allowSpaceToSelect: true });
  }

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
        this.toggleActive(options);
        break;
      case ' ':
        if (opts.allowSpaceToSelect) {
          event.preventDefault();
          this.toggleActive(options);
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

  private toggleActive(options: readonly TOption[]): void {
    const option = options[this.activeIndex()];
    if (option !== undefined) {
      this.toggleOption(option);
    }
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

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}

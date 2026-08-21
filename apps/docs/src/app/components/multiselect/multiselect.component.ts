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
import { TagComponent } from '../tag/tag.component';

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
  selector: 's-multiselect',
  imports: [SIconComponent, NgTemplateOutlet, ErrorMessageComponent, TagComponent],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
  },
})
export class MultiselectComponent<TOption = unknown> extends BaseFormFieldControl<unknown[]> {
  protected readonly icons = injectSemiUIIcons();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly triggerButton = viewChild<ElementRef<HTMLDivElement>>('triggerButton');
  private readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');
  private readonly valueRuler = viewChild<ElementRef<HTMLSpanElement>>('valueRuler');

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
  /** Shows a master checkbox in the lead of the filter row that selects/clears every filtered option. */
  showSelectAll = input(true, { transform: booleanAttribute });
  /** Once more than this many items are selected, the trigger shows "N selected" instead of chips. */
  maxChipsDisplay = input(3);
  /** Shows a remove ("x") button on each chip, via `<s-tag removable>`. Set to `false` for read-only chips. */
  removableChips = input(true, { transform: booleanAttribute });
  /** Shows a spinner in place of the chevron and disables interaction, for async option loading. */
  loading = input(false, { transform: booleanAttribute });
  /** Moves the panel to a direct child of `document.body`, escaping any ancestor's `overflow: hidden` clipping or `transform`/`filter` stacking context. */
  appendTo = input<'body' | null>(null);

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
  protected readonly fixedPosition = signal({ top: 0, left: 0, width: 0 });
  protected readonly listboxId = `s-multiselect-listbox-${nextMultiselectId++}`;
  protected readonly activeOptionId = computed(() =>
    this.open() && this.activeIndex() >= 0 ? `${this.listboxId}-option-${this.activeIndex()}` : null,
  );

  protected readonly selectedOptions = computed<TOption[]>(() => {
    const values = this.value();
    return this.options().filter((option) => values.includes(this.resolveValue(option)));
  });

  protected readonly showClear = computed(
    () => this.clearable() && !this.effectiveDisabled() && !this.loading() && this.value().length > 0,
  );

  protected readonly filteredOptions = computed<readonly TOption[]>(() => {
    const query = this.filterText().trim().toLowerCase();
    const all = this.options();
    if (!this.filterable() || !query) {
      return all;
    }
    return all.filter((option) => this.labelFor(option).toLowerCase().includes(query));
  });

  protected readonly allFilteredSelected = computed(() => {
    const filtered = this.filteredOptions();
    return filtered.length > 0 && filtered.every((option) => this.isSelected(option));
  });

  protected readonly someFilteredSelected = computed(
    () => !this.allFilteredSelected() && this.filteredOptions().some((option) => this.isSelected(option)),
  );

  private readonly focusFilterOnOpen = afterRenderEffect(() => {
    if (this.open() && this.filterable()) {
      this.filterInput()?.nativeElement.focus();
    }
  });

  /** A single line of plain text (via `.s-multiselect__placeholder`'s own font) is the height
   * Select/TextInput naturally render at, since neither sets an explicit line-height and browsers
   * don't expose "line-height: normal"'s resolved px value to CSS -- it can only be read back from
   * a real rendered box. `<s-tag>` chips are naturally taller than that (their own padding/border),
   * so pinning each chip's height to this measurement (below, on the #chip tags) is what keeps the
   * trigger's height matching Select/TextInput exactly, in any preset, at any zoom/DPI, instead of
   * a hand-tuned CSS guess that's only ever approximately right for one preset's font metrics. */
  protected readonly chipHeightPx = signal<number | null>(null);

  private readonly measureChipHeight = afterRenderEffect(() => {
    this.selectedOptions();
    const ruler = this.valueRuler()?.nativeElement;
    if (!ruler) {
      return;
    }
    this.chipHeightPx.set(ruler.getBoundingClientRect().height);
  });

  /** Moves the panel to `document.body` and positions it by pixel coordinates once it exists in the DOM. */
  private readonly appendToBodyEffect = afterRenderEffect(() => {
    if (this.open() && this.appendTo() === 'body') {
      this.positionAppendedPanel();
    }
  });

  protected override emptyValue(): unknown[] {
    return [];
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

  protected isSelected(option: TOption): boolean {
    return this.value().includes(this.resolveValue(option));
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

  protected removeChip(option: TOption, event?: MouseEvent): void {
    event?.stopPropagation();
    if (this.effectiveDisabled()) {
      return;
    }
    const val = this.resolveValue(option);
    this.value.set(this.value().filter((v) => v !== val));
  }

  protected toggleSelectAll(): void {
    if (this.effectiveDisabled() || this.loading()) {
      return;
    }
    if (this.allFilteredSelected()) {
      const visibleValues = new Set(this.filteredOptions().map((option) => this.resolveValue(option)));
      this.value.set(this.value().filter((v) => !visibleValues.has(v)));
    } else {
      const visibleValues = this.filteredOptions().map((option) => this.resolveValue(option));
      this.value.set([...new Set([...this.value(), ...visibleValues])]);
    }
    this.refocusFilterIfOpen();
  }

  protected clearAll(event?: MouseEvent): void {
    event?.stopPropagation();
    if (this.effectiveDisabled() || this.loading()) {
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
    if (this.effectiveDisabled() || this.loading()) {
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

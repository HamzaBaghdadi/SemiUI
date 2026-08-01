import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { IconRef } from '@zaytoon/tokens';

export interface SelectOptionContext<T> {
  $implicit: T;
  index: number;
  selected: boolean;
}

const DEFAULT_ICON: IconRef = { type: 'ng-icon', name: 'lucideChevronDown' };
let nextSelectId = 0;

/**
 * A listbox-based select: works with plain values or option objects (via `optionLabel` /
 * `optionValue`), and supports ngModel, reactive forms, and Signal Forms through
 * `BaseFormFieldControl`. Custom rendering via named `<ng-template>` slots -- see the
 * `#selected` / `#option` / `#icon` / `#header` / `#footer` template variables referenced below.
 */
@Component({
  selector: 'z-select',
  imports: [ZIconComponent, NgTemplateOutlet],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
  },
})
export class SelectComponent<TOption = unknown> extends BaseFormFieldControl<unknown> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly triggerButton = viewChild<ElementRef<HTMLButtonElement>>('triggerButton');

  options = input<readonly TOption[]>([]);
  /** Property to read the display label from, when options are objects. Omit for primitive options. */
  optionLabel = input<string>();
  /** Property to read the bound value from, when options are objects. Omit to use the whole option as the value. */
  optionValue = input<string>();
  placeholder = input('');

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
  protected readonly defaultIcon = DEFAULT_ICON;
  protected readonly listboxId = `z-select-listbox-${nextSelectId++}`;
  protected readonly activeOptionId = computed(() =>
    this.open() && this.activeIndex() >= 0 ? `${this.listboxId}-option-${this.activeIndex()}` : null,
  );

  protected readonly selectedOption = computed<TOption | undefined>(() => {
    const value = this.value();
    if (value === undefined) {
      return undefined;
    }
    return this.options().find((option) => this.resolveValue(option) === value);
  });

  protected readonly selectedLabel = computed(() => {
    const option = this.selectedOption();
    return option === undefined ? '' : this.labelFor(option);
  });

  protected override emptyValue(): unknown {
    return undefined;
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
    const currentIndex = this.options().findIndex((option) => option === this.selectedOption());
    this.activeIndex.set(currentIndex >= 0 ? currentIndex : 0);
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

  /**
   * Handles all keyboard interaction, in both closed and open state. Focus deliberately never
   * leaves the trigger button -- this is the standard ARIA "combobox with listbox popup" pattern:
   * the currently-highlighted option is tracked virtually (`activeIndex`, surfaced to assistive
   * tech via `aria-activedescendant`) rather than by moving real DOM focus into the list.
   */
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

    const count = this.options().length;
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
      case ' ': {
        event.preventDefault();
        const option = this.options()[this.activeIndex()];
        if (option !== undefined) {
          this.selectOption(option);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}

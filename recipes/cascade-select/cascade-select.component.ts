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

export interface CascadeSelectOptionContext<T> {
  $implicit: T;
  index: number;
  level: number;
  hasChildren: boolean;
  selected: boolean;
}

/** How far below (or above) the trigger the panel needs to fit before it flips sides. */
const PANEL_SPACE_ESTIMATE_PX = 320;

let nextCascadeSelectId = 0;

/**
 * A hierarchical select: each level's children open as an adjacent column, same trigger/panel
 * chrome as Select but with `options` shaped as a tree (each node's children read from
 * `optionChildren`, default `'children'`). Only leaf nodes (no children) are selectable -- picking
 * one sets `value` to that leaf's resolved value; the trigger shows the full label path. Supports
 * ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl`. No built-in filter box
 * (unlike Select/Multiselect) -- filtering a tree by a flat query doesn't have one obvious meaning,
 * so it's left to consumers who need it via a custom `#option` template.
 */
@Component({
  selector: 's-cascade-select',
  imports: [SIconComponent, NgTemplateOutlet, ErrorMessageComponent],
  templateUrl: './cascade-select.component.html',
  styleUrl: './cascade-select.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
  },
})
export class CascadeSelectComponent<TOption = unknown> extends BaseFormFieldControl<unknown> {
  protected readonly icons = injectSemiUIIcons();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly triggerButton = viewChild<ElementRef<HTMLButtonElement>>('triggerButton');
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');

  options = input<readonly TOption[]>([]);
  /** Property to read the display label from, when options are objects. Omit for primitive options. */
  optionLabel = input<string>();
  /** Property to read the bound value from, when options are objects. Omit to use the whole option as the value. */
  optionValue = input<string>();
  /** Property to read each node's child options from. */
  optionChildren = input('children');
  placeholder = input('');
  /** Joins each level's label into the trigger's display text. */
  separator = input(' / ');
  errorMessage = input('');
  /** Shows a clear ("x") affordance when a value is selected. */
  clearable = input(true, { transform: booleanAttribute });
  emptyMessage = input('No results found');
  /** Shows a spinner in place of the chevron and disables interaction, for async option loading. */
  loading = input(false, { transform: booleanAttribute });
  /** Moves the panel to a direct child of `document.body`, escaping any ancestor's `overflow: hidden` clipping or `transform`/`filter` stacking context. */
  appendTo = input<'body' | null>(null);

  /** Custom rendering for the selected value shown in the closed trigger. Context: the selected leaf path (root-to-leaf), or []. */
  protected selectedTemplate = contentChild<unknown, TemplateRef<{ $implicit: TOption[] }>>('selected', {
    read: TemplateRef,
  });
  /** Custom rendering for each option in the open columns. Context: `CascadeSelectOptionContext<TOption>`. */
  protected optionTemplate = contentChild<unknown, TemplateRef<CascadeSelectOptionContext<TOption>>>('option', {
    read: TemplateRef,
  });
  /** Custom trigger icon, replacing the default chevron. */
  protected iconTemplate = contentChild<unknown, TemplateRef<unknown>>('icon', { read: TemplateRef });

  protected readonly open = signal(false);
  /** The drilled-into ancestor chain currently expanded in the panel -- one entry per open column beyond the first. */
  protected readonly expandedPath = signal<TOption[]>([]);
  /** Highlighted index per open column, index-aligned with `columns()`. */
  protected readonly activeIndexPath = signal<number[]>([0]);
  /** The confirmed selection, root-to-leaf. Empty when nothing's selected. */
  protected readonly selectedPath = signal<TOption[]>([]);
  protected readonly panelPlacement = signal<'top' | 'bottom'>('bottom');
  protected readonly fixedPosition = signal({ top: 0, left: 0, width: 0 });
  protected readonly listboxId = `s-cascade-select-listbox-${nextCascadeSelectId++}`;

  protected readonly columns = computed<(readonly TOption[])[]>(() => {
    const cols: (readonly TOption[])[] = [this.options()];
    for (const node of this.expandedPath()) {
      const kids = this.childrenOf(node);
      if (!kids || kids.length === 0) {
        break;
      }
      cols.push(kids);
    }
    return cols;
  });

  protected readonly selectedLabels = computed(() => this.selectedPath().map((option) => this.labelFor(option)));

  protected readonly showClear = computed(
    () => this.clearable() && !this.effectiveDisabled() && !this.loading() && this.selectedPath().length > 0,
  );

  /** Moves the panel to `document.body` and positions it by pixel coordinates once it exists in the DOM. */
  private readonly appendToBodyEffect = afterRenderEffect(() => {
    if (this.open() && this.appendTo() === 'body') {
      this.positionAppendedPanel();
    }
  });

  /**
   * `null`, not `undefined` -- writing `undefined` into a Signal Forms model deletes that property
   * from the model object, orphaning the field node (NG01902 "Orphan field") and permanently
   * breaking the view's reactive graph. `null` keeps the property present.
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

  protected childrenOf(option: TOption): TOption[] | undefined {
    const key = this.optionChildren();
    const kids = (option as Record<string, unknown>)[key];
    return Array.isArray(kids) ? (kids as TOption[]) : undefined;
  }

  protected hasChildren(option: TOption): boolean {
    return (this.childrenOf(option)?.length ?? 0) > 0;
  }

  protected activeIndexFor(colIndex: number): number {
    return this.activeIndexPath()[colIndex] ?? -1;
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
    this.expandedPath.set([]);
    this.activeIndexPath.set([0]);
    this.updatePlacement();
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.handleBlur();
  }

  protected onOptionHover(colIndex: number, index: number, option: TOption): void {
    this.setActive(colIndex, index);
    if (this.hasChildren(option)) {
      this.expandTo(colIndex, option);
    }
  }

  protected onOptionClick(colIndex: number, index: number, option: TOption): void {
    this.setActive(colIndex, index);
    if (this.hasChildren(option)) {
      this.expandTo(colIndex, option);
    } else {
      this.selectLeaf(colIndex, option);
    }
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
    this.selectedPath.set([]);
    this.close();
    this.triggerButton()?.nativeElement.focus();
  }

  private setActive(colIndex: number, index: number): void {
    this.activeIndexPath.update((path) => {
      const next = path.slice(0, colIndex + 1);
      next[colIndex] = index;
      return next;
    });
  }

  private expandTo(colIndex: number, option: TOption): void {
    this.expandedPath.update((path) => [...path.slice(0, colIndex), option]);
    this.activeIndexPath.update((path) => {
      const next = path.slice(0, colIndex + 1);
      next[colIndex + 1] = 0;
      return next;
    });
  }

  private selectLeaf(colIndex: number, leaf: TOption): void {
    this.selectedPath.set([...this.expandedPath().slice(0, colIndex), leaf]);
    this.value.set(this.resolveValue(leaf));
    this.close();
    this.triggerButton()?.nativeElement.focus();
  }

  /**
   * Handles keydown on the trigger button. Focus stays on the trigger throughout (there's no
   * filter box to hand it off to) -- arrow keys navigate whichever column is currently rightmost,
   * ArrowRight drills into the active item's children, ArrowLeft steps back a column.
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
      if ((event.key === 'Backspace' || event.key === 'Delete') && this.clearable() && this.selectedPath().length > 0) {
        event.preventDefault();
        this.clearValue();
      }
      return;
    }

    const cols = this.columns();
    const colIndex = cols.length - 1;
    const colOptions = cols[colIndex] ?? [];
    const activeIndex = this.activeIndexFor(colIndex);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.setActive(colIndex, Math.min(activeIndex + 1, colOptions.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.setActive(colIndex, Math.max(activeIndex - 1, 0));
        break;
      case 'ArrowRight': {
        event.preventDefault();
        const option = colOptions[activeIndex];
        if (option && this.hasChildren(option)) {
          this.expandTo(colIndex, option);
        }
        break;
      }
      case 'ArrowLeft':
        event.preventDefault();
        if (colIndex > 0) {
          this.expandedPath.update((path) => path.slice(0, colIndex - 1));
          this.activeIndexPath.update((path) => path.slice(0, colIndex));
        }
        break;
      case 'Home':
        event.preventDefault();
        this.setActive(colIndex, 0);
        break;
      case 'End':
        event.preventDefault();
        this.setActive(colIndex, colOptions.length - 1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const option = colOptions[activeIndex];
        if (option) {
          if (this.hasChildren(option)) {
            this.expandTo(colIndex, option);
          } else {
            this.selectLeaf(colIndex, option);
          }
        }
        break;
      }
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

  /**
   * Picks which side of the trigger the panel opens on, based on available viewport space --
   * bottom by default, flipping to top when there isn't enough room below but there is above.
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

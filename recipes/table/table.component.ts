import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, booleanAttribute, computed, contentChild, input, model, output, signal } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SelectComponent } from '../select/select.component';
import { TextInputComponent } from '../text-input/text-input.component';

export interface TableColumn<T = unknown> {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
  /** 'start'/'end' follow reading direction (flip under RTL) -- prefer them over 'left'/'right',
   * which pin to that literal physical side regardless of direction and are only here for the
   * rare column that genuinely wants that (both pass straight through to CSS `text-align`, so
   * either works with no other change needed). */
  align?: 'left' | 'center' | 'right' | 'start' | 'end';
  /** Custom comparator for sorting this column; falls back to a generic `<`/`>` comparison of the field's value. */
  sortFn?: (a: T, b: T) => number;
}

export type SortDirection = 'asc' | 'desc' | null;
export type TableSelectionMode = 'none' | 'single' | 'multiple';

export interface TableCellContext<T> {
  $implicit: T;
  column: TableColumn<T>;
  value: unknown;
  index: number;
}

/**
 * A data-driven table: pass `columns` and `data`. Sorting (click a sortable header), a global
 * filter box, row selection (single/multiple, with a header checkbox for "select all visible" in
 * multiple mode), and pagination (reusing `<s-pagination>`) are all opt-in via inputs rather than
 * always present, so a plain read-only table stays plain. An optional `#cell` template slot
 * customizes rendering per cell -- context is `{ $implicit: row, column, value, index }`, so the
 * template typically `@switch`es on `column.field`.
 */
@Component({
  selector: 's-table',
  imports: [SIconComponent, NgTemplateOutlet, PaginationComponent, TextInputComponent, CheckboxComponent, SelectComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent<T = Record<string, unknown>> {
  protected readonly icons = injectSemiUIIcons();

  columns = input<readonly TableColumn<T>[]>([]);
  data = input<readonly T[]>([]);
  /** Identity function for selection tracking and row diffing. Defaults to reference equality (the row object itself). */
  rowKey = input<(row: T) => unknown>((row) => row);
  selectionMode = input<TableSelectionMode>('none');
  /** The currently selected rows. Two-way bindable. */
  selection = model<T[]>([]);
  filterable = input(false, { transform: booleanAttribute });
  filterPlaceholder = input('Search...');
  paginated = input(false, { transform: booleanAttribute });
  /** Rows per page. Two-way bindable -- the rows-per-page dropdown (when `rowsPerPageOptions` is set) writes back to it directly. */
  pageSize = model(10);
  /** Shows a rows-per-page dropdown in the footer when non-empty, e.g. `[5, 10, 25, 50]`. */
  rowsPerPageOptions = input<readonly number[]>([]);
  loading = input(false, { transform: booleanAttribute });
  striped = input(true, { transform: booleanAttribute });
  stickyHeader = input(false, { transform: booleanAttribute });
  emptyMessage = input('No data available');
  /**
   * Shows a "Showing X to Y of Z entries" summary in the footer. Pass a template string with
   * `{first}`/`{last}`/`{total}` placeholders to customize the wording.
   */
  showSummary = input(false, { transform: booleanAttribute });
  summaryTemplate = input('Showing {first} to {last} of {total} entries');

  /** Emitted when a row is clicked, regardless of selectionMode. */
  rowClick = output<T>();

  /** Custom per-cell rendering. Context: `{ $implicit: row, column, value, index }`. Falls back to the raw field value as text. */
  protected cellTemplate = contentChild<unknown, TemplateRef<TableCellContext<T>>>('cell', { read: TemplateRef });
  /** Rendered above the table, alongside the filter box (if shown). */
  protected headerTemplate = contentChild<unknown, TemplateRef<unknown>>('header', { read: TemplateRef });
  /** Rendered in the footer, alongside pagination/summary/rows-per-page. */
  protected footerTemplate = contentChild<unknown, TemplateRef<unknown>>('footer', { read: TemplateRef });
  /** Replaces the default spinner + "Loading..." row while `loading` is true. */
  protected loadingTemplate = contentChild<unknown, TemplateRef<unknown>>('loading', { read: TemplateRef });

  protected readonly sortField = signal('');
  protected readonly sortDirection = signal<SortDirection>(null);
  protected readonly filterText = signal('');
  protected readonly currentPage = signal(1);

  protected readonly filteredData = computed(() => {
    const query = this.filterText().trim().toLowerCase();
    const all = this.data();
    if (!this.filterable() || !query) {
      return all;
    }
    const cols = this.columns();
    return all.filter((row) => cols.some((col) => String(this.cellValue(row, col.field) ?? '').toLowerCase().includes(query)));
  });

  protected readonly sortedData = computed(() => {
    const field = this.sortField();
    const direction = this.sortDirection();
    const rows = this.filteredData();
    if (!field || !direction) {
      return rows;
    }
    const column = this.columns().find((c) => c.field === field);
    const sorted = [...rows].sort((a, b) => {
      if (column?.sortFn) {
        return column.sortFn(a, b);
      }
      const av = this.cellValue(a, field);
      const bv = this.cellValue(b, field);
      if (av === bv) {
        return 0;
      }
      if (av === null || av === undefined) {
        return -1;
      }
      if (bv === null || bv === undefined) {
        return 1;
      }
      return av > bv ? 1 : -1;
    });
    return direction === 'asc' ? sorted : sorted.reverse();
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedData().length / this.pageSize())));

  protected readonly pagedData = computed(() => {
    if (!this.paginated()) {
      return this.sortedData();
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.sortedData().slice(start, start + this.pageSize());
  });

  protected readonly allVisibleSelected = computed(() => {
    const visible = this.pagedData();
    return visible.length > 0 && visible.every((row) => this.isSelected(row));
  });

  protected readonly someVisibleSelected = computed(
    () => !this.allVisibleSelected() && this.pagedData().some((row) => this.isSelected(row)),
  );

  protected readonly summaryText = computed(() => {
    const total = this.sortedData().length;
    const template = this.summaryTemplate();
    if (total === 0) {
      return template.replace('{first}', '0').replace('{last}', '0').replace('{total}', '0');
    }
    const page = this.paginated() ? Math.min(this.currentPage(), this.totalPages()) : 1;
    const size = this.paginated() ? this.pageSize() : total;
    const first = (page - 1) * size + 1;
    const last = Math.min(page * size, total);
    return template.replace('{first}', String(first)).replace('{last}', String(last)).replace('{total}', String(total));
  });

  /** Whether the footer has anything besides pagination -- when it doesn't, pagination centers itself instead of sitting flush to one side. */
  protected readonly hasFooterExtras = computed(
    () => this.showSummary() || this.rowsPerPageOptions().length > 0 || !!this.footerTemplate(),
  );

  protected cellValue(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field];
  }

  protected toggleSort(column: TableColumn<T>): void {
    if (!column.sortable) {
      return;
    }
    if (this.sortField() !== column.field) {
      this.sortField.set(column.field);
      this.sortDirection.set('asc');
      return;
    }
    if (this.sortDirection() === 'asc') {
      this.sortDirection.set('desc');
    } else {
      this.sortField.set('');
      this.sortDirection.set(null);
    }
  }

  protected isSelected(row: T): boolean {
    const key = this.rowKey();
    const rowKeyValue = key(row);
    return this.selection().some((selected) => key(selected) === rowKeyValue);
  }

  protected onRowClick(row: T): void {
    this.rowClick.emit(row);
    if (this.selectionMode() === 'single') {
      this.toggleRowSelection(row);
    }
  }

  protected toggleRowSelection(row: T): void {
    if (this.selectionMode() === 'none') {
      return;
    }
    const key = this.rowKey();
    if (this.selectionMode() === 'single') {
      this.selection.set(this.isSelected(row) ? [] : [row]);
      return;
    }
    if (this.isSelected(row)) {
      const rowKeyValue = key(row);
      this.selection.update((current) => current.filter((selected) => key(selected) !== rowKeyValue));
    } else {
      this.selection.update((current) => [...current, row]);
    }
  }

  protected toggleSelectAllVisible(): void {
    const key = this.rowKey();
    if (this.allVisibleSelected()) {
      const visibleKeys = new Set(this.pagedData().map(key));
      this.selection.update((current) => current.filter((selected) => !visibleKeys.has(key(selected))));
    } else {
      const currentKeys = new Set(this.selection().map(key));
      const toAdd = this.pagedData().filter((row) => !currentKeys.has(key(row)));
      this.selection.update((current) => [...current, ...toAdd]);
    }
  }

  protected onFilterInput(value: string): void {
    this.filterText.set(value);
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}

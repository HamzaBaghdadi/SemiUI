import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, booleanAttribute, computed, contentChild, effect, input, model, output, untracked } from '@angular/core';
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

/** Emitted by `sortChange` when a sortable header is clicked. `direction: null` means the column
 * was cycled back to unsorted. */
export interface TableSortEvent {
  field: string;
  direction: SortDirection;
}

/**
 * Everything a server needs to answer one page request, emitted by `lazyLoad` whenever any part
 * of it changes (and once on init, so the first page can be fetched from the same handler).
 *
 * `first`/`rows` are the offset-and-limit pair most APIs take; `page` is the same position as a
 * 1-based page number, for APIs that paginate that way. Use whichever fits -- they always agree.
 */
export interface TableLazyLoadEvent {
  /** Zero-based index of the first row to fetch. */
  first: number;
  /** How many rows to fetch -- the current page size. */
  rows: number;
  /** 1-based page number, the same position as `first`. */
  page: number;
  sortField: string;
  sortDirection: SortDirection;
  /** The global filter text, trimmed. Empty string when there is no filter. */
  filter: string;
}

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
 *
 * All of that filtering/sorting/paging happens in the browser over the whole `data` array, which
 * stops being viable once the dataset outgrows what you want to ship to the client. `lazy` turns
 * it off: the table renders `data` exactly as given, reads its page count from `totalRecords`,
 * and emits `lazyLoad` with the offset, page size, sort and filter every time any of them changes
 * -- so the server does the work and `data` only ever holds the current page.
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
  /**
   * Hands filtering, sorting and paging to the caller instead of doing them over `data`. The table
   * renders `data` untouched, takes its total from `totalRecords`, and reports what to fetch
   * through `lazyLoad`.
   */
  lazy = input(false, { transform: booleanAttribute });
  /**
   * How many rows exist in total on the server. Only read when `lazy` is set -- it is what the
   * page count and the summary are computed from, since `data` holds one page. Falls back to
   * `data.length` while it is null, which renders a single page.
   */
  totalRecords = input<number | null>(null);
  /** The current 1-based page. Two-way bindable, so it can be restored from a URL or reset from
   * outside; emits `pageChange` whenever the user pages. */
  page = model(1);
  /** Rows per page. Two-way bindable -- the rows-per-page dropdown (when `rowsPerPageOptions` is set) writes back to it directly, emitting `pageSizeChange`. */
  pageSize = model(10);
  /** The sorted column's field, or `''` for none. Two-way bindable; see also `sortChange`. */
  sortField = model('');
  /** The sort direction, or `null` for none. Two-way bindable; see also `sortChange`. */
  sortDirection = model<SortDirection>(null);
  /** The global filter text. Two-way bindable, so it emits `filterValueChange` as the user types
   * and can be seeded or cleared from outside. */
  filterValue = model('');
  /** Shows a rows-per-page dropdown in the footer when non-empty, e.g. `[5, 10, 25, 50]`. */
  rowsPerPageOptions = input<readonly number[]>([]);
  loading = input(false, { transform: booleanAttribute });
  striped = input(false, { transform: booleanAttribute });
  showGridlines = input(false, { transform: booleanAttribute });
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
  /** Emitted when a sortable header is clicked, after the new sort has been applied. `sortField`
   * and `sortDirection` also emit their own change events; this one carries both together. */
  sortChange = output<TableSortEvent>();
  /**
   * Emitted only while `lazy` is set: once on init, and then whenever the page, page size, sort or
   * filter changes. Everything needed to fetch that page is on the event.
   *
   * Note that this fires on every filter keystroke -- debounce inside the handler if each one
   * would become a request.
   */
  lazyLoad = output<TableLazyLoadEvent>();

  /** Custom per-cell rendering. Context: `{ $implicit: row, column, value, index }`. Falls back to the raw field value as text. */
  protected cellTemplate = contentChild<unknown, TemplateRef<TableCellContext<T>>>('cell', { read: TemplateRef });
  /** Rendered above the table, alongside the filter box (if shown). */
  protected headerTemplate = contentChild<unknown, TemplateRef<unknown>>('header', { read: TemplateRef });
  /** Rendered in the footer, alongside pagination/summary/rows-per-page. */
  protected footerTemplate = contentChild<unknown, TemplateRef<unknown>>('footer', { read: TemplateRef });
  /** Replaces the default spinner + "Loading..." row while `loading` is true. */
  protected loadingTemplate = contentChild<unknown, TemplateRef<unknown>>('loading', { read: TemplateRef });

  constructor() {
    // Reads every part of the request before checking `lazy`, so the effect stays subscribed to
    // all of them regardless of mode and starts emitting the moment lazy is switched on. The emit
    // is untracked so a handler that writes signals of its own can't re-enter this effect.
    effect(() => {
      const rows = this.pageSize();
      const page = this.page();
      const sortField = this.sortField();
      const sortDirection = this.sortDirection();
      const filter = this.filterValue().trim();
      if (!this.lazy()) {
        return;
      }
      untracked(() => this.lazyLoad.emit({ first: (page - 1) * rows, rows, page, sortField, sortDirection, filter }));
    });
  }

  protected readonly filteredData = computed(() => {
    // In lazy mode the rows arriving in `data` are already the filtered page.
    if (this.lazy()) {
      return this.data();
    }
    const query = this.filterValue().trim().toLowerCase();
    const all = this.data();
    if (!this.filterable() || !query) {
      return all;
    }
    const cols = this.columns();
    return all.filter((row) => cols.some((col) => String(this.cellValue(row, col.field) ?? '').toLowerCase().includes(query)));
  });

  protected readonly sortedData = computed(() => {
    const rows = this.filteredData();
    if (this.lazy()) {
      return rows;
    }
    const field = this.sortField();
    const direction = this.sortDirection();
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

  /** How many rows the table is paging through: every row it holds when it does the work itself,
   * or the server's reported total when it doesn't. */
  protected readonly totalRows = computed(() =>
    this.lazy() ? (this.totalRecords() ?? this.data().length) : this.sortedData().length,
  );

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalRows() / this.pageSize())));

  protected readonly pagedData = computed(() => {
    // Lazy data is already one page; slicing it again would show a page of a page.
    if (this.lazy() || !this.paginated()) {
      return this.sortedData();
    }
    const page = Math.min(this.page(), this.totalPages());
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
    const total = this.totalRows();
    const template = this.summaryTemplate();
    if (total === 0) {
      return template.replace('{first}', '0').replace('{last}', '0').replace('{total}', '0');
    }
    const page = this.paginated() ? Math.min(this.page(), this.totalPages()) : 1;
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
    } else if (this.sortDirection() === 'asc') {
      this.sortDirection.set('desc');
    } else {
      this.sortField.set('');
      this.sortDirection.set(null);
    }
    // Re-sorting puts different rows on every page, so the page the user was on no longer means
    // anything -- the same reason filtering and changing the page size reset it.
    this.page.set(1);
    this.sortChange.emit({ field: this.sortField(), direction: this.sortDirection() });
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
    this.filterValue.set(value);
    this.page.set(1);
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }
}

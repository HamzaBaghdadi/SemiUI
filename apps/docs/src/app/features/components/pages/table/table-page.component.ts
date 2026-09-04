import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TableColumn, TableComponent, TableLazyLoadEvent, TableSortEvent } from '../../../../components/table/table.component';
import { TagComponent } from '../../../../components/tag/tag.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  age: number;
}

const FIRST_NAMES = ['Ava', 'Liam', 'Mia', 'Noah', 'Zoe', 'Ethan', 'Grace', 'Leo', 'Ruby', 'Owen', 'Nina', 'Max'];
const LAST_NAMES = ['Carter', 'Nguyen', 'Patel', 'Silva', 'Kim', 'Rossi', 'Novak', 'Haddad', 'Berg', 'Diallo'];
const ROLES = ['Engineer', 'Designer', 'Product Manager', 'Support', 'Sales'];
const STATUSES: Person['status'][] = ['active', 'invited', 'suspended'];

function buildPeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      role: ROLES[i % ROLES.length],
      status: STATUSES[i % STATUSES.length],
      age: 22 + (i % 40),
    };
  });
}

@Component({
  selector: 'app-table-page',
  imports: [
    TableComponent,
    TagComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './table-page.component.html',
  styleUrl: './table-page.component.css',
})
export class TablePageComponent {
  protected people = buildPeople(8);
  protected manyPeople = buildPeople(47);

  protected basicColumns: TableColumn<Person>[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'role', header: 'Role', sortable: true },
    { field: 'age', header: 'Age', sortable: true, align: 'end', width: '5rem' },
  ];

  protected statusColumns: TableColumn<Person>[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'role', header: 'Role', sortable: true },
    { field: 'status', header: 'Status', sortable: true },
  ];

  protected selection: Person[] = [];
  protected isLoadingDemo = signal(false);
  protected footerPageSize = signal(10);

  // --- lazy demo ---------------------------------------------------------------------------
  // `lazyPeople` holds one page at a time; `allPeople` is the "database" the fake server queries.
  private readonly allPeople = buildPeople(213);
  protected readonly lazyPeople = signal<Person[]>([]);
  protected readonly lazyTotal = signal(0);
  protected readonly lazyLoading = signal(false);
  protected readonly lazyLastRequest = signal('(waiting for the first request)');
  /** Guards against an earlier, slower response overwriting a newer one. */
  private lazyRequestId = 0;

  /** Stands in for a paginated API: does the filtering, sorting and slicing the table is no longer
   * doing, then answers after a delay so the loading state is visible. */
  protected onLazyLoad(event: TableLazyLoadEvent): void {
    this.lazyLastRequest.set(
      `first=${event.first}  rows=${event.rows}  page=${event.page}  sort=${event.sortField || '-'}${
        event.sortDirection ? ' ' + event.sortDirection : ''
      }  filter="${event.filter}"`,
    );
    this.lazyLoading.set(true);
    const requestId = ++this.lazyRequestId;

    setTimeout(() => {
      if (requestId !== this.lazyRequestId) {
        return; // superseded by a newer request
      }
      const query = event.filter.toLowerCase();
      const rows = query
        ? this.allPeople.filter((p) => [p.name, p.email, p.role].some((v) => v.toLowerCase().includes(query)))
        : [...this.allPeople];

      if (event.sortField && event.sortDirection) {
        const field = event.sortField as keyof Person;
        rows.sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0));
        if (event.sortDirection === 'desc') {
          rows.reverse();
        }
      }

      this.lazyTotal.set(rows.length);
      this.lazyPeople.set(rows.slice(event.first, event.first + event.rows));
      this.lazyLoading.set(false);
    }, 350);
  }

  protected onSortChange(event: TableSortEvent): void {
    this.lastSort.set(event.direction ? `${event.field} ${event.direction}` : '(unsorted)');
  }

  protected readonly lastSort = signal('(unsorted)');

  protected statusVariant(status: Person['status']): 'primary' | 'default' | 'destructive' {
    if (status === 'active') return 'primary';
    if (status === 'invited') return 'default';
    return 'destructive';
  }

  toggleLoading(): void {
    this.isLoadingDemo.update((value) => !value);
  }

  protected readonly lazyCode = `<s-table
  [columns]="columns"
  [data]="rows()"
  [lazy]="true"
  [totalRecords]="total()"
  [loading]="loading()"
  [paginated]="true"
  [filterable]="true"
  [rowsPerPageOptions]="[5, 10, 25]"
  (lazyLoad)="load($event)"
/>`;

  protected readonly lazyHandlerCode = `protected rows = signal<Person[]>([]);
protected total = signal(0);
protected loading = signal(false);

// Fires once on init, then on every page / page-size / sort / filter change.
protected load(event: TableLazyLoadEvent): void {
  this.loading.set(true);
  this.api
    .getPeople({
      offset: event.first,          // or event.page, if your API is 1-based
      limit: event.rows,
      sortBy: event.sortField,
      sortDir: event.sortDirection, // 'asc' | 'desc' | null
      search: event.filter,
    })
    .subscribe(({ rows, total }) => {
      this.rows.set(rows);
      this.total.set(total);
      this.loading.set(false);
    });
}`;

  protected readonly eventsCode = `<s-table
  [columns]="columns"
  [data]="people"
  [paginated]="true"
  [filterable]="true"
  [(page)]="page"
  [(pageSize)]="pageSize"
  [(filterValue)]="search"
  (pageChange)="onPage($event)"
  (pageSizeChange)="onRowsChange($event)"
  (filterValueChange)="onSearch($event)"
  (sortChange)="onSort($event)"
  (selectionChange)="onSelect($event)"
/>`;

  protected readonly basicUsageCode = `protected columns: TableColumn<Person>[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'email', header: 'Email', sortable: true },
];

<s-table [columns]="columns" [data]="people" />`;

  protected readonly stripedGridlinesCode = `<s-table [columns]="columns" [data]="people" [striped]="true" [showGridlines]="true" />`;

  protected readonly cellTemplateCode = `<s-table [columns]="columns" [data]="people">
  <ng-template #cell let-row let-column="column" let-value="value">
    @if (column.field === 'status') {
      <s-tag [variant]="statusVariant(value)">{{ value }}</s-tag>
    } @else {
      {{ value }}
    }
  </ng-template>
</s-table>`;

  protected readonly filterableCode = `<s-table
  [columns]="columns"
  [data]="people"
  [filterable]="true"
  selectionMode="multiple"
  [(selection)]="selection"
  [paginated]="true"
  [pageSize]="10"
/>`;

  protected readonly singleSelectionCode = `<s-table [columns]="columns" [data]="people" selectionMode="single" />`;

  protected readonly footerCode = `<s-table
  [columns]="columns"
  [data]="people"
  [paginated]="true"
  [(pageSize)]="pageSize"
  [rowsPerPageOptions]="[5, 10, 25]"
  [showSummary]="true"
>
  <ng-template #header>...</ng-template>
  <ng-template #footer>...</ng-template>
</s-table>`;

  protected readonly loadingCode = `<s-table [loading]="isLoading()">
  <ng-template #loading>Fetching people, hold on&hellip;</ng-template>
</s-table>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'columns',
      type: 'readonly TableColumn<T>[]',
      default: '[]',
      description:
        "Column definitions. TableColumn: { field: string; header: string; sortable?: boolean; width?: string; align?: 'left' | 'center' | 'right' | 'start' | 'end'; sortFn?: (a: T, b: T) => number }. 'start'/'end' follow reading direction (flip under RTL); 'left'/'right' pin to a literal physical side.",
    },
    {
      name: 'data',
      type: 'readonly T[]',
      default: '[]',
      description: 'The row objects to render.',
    },
    {
      name: 'rowKey',
      type: '(row: T) => unknown',
      default: '(row) => row',
      description: 'Identity function for selection tracking and row diffing. Defaults to reference equality (the row object itself).',
    },
    {
      name: 'selectionMode',
      type: "'none' | 'single' | 'multiple'",
      default: "'none'",
      description: "Row selection mode. 'multiple' adds a header checkbox for select-all-visible.",
    },
    {
      name: 'selection',
      type: 'T[]',
      default: '[]',
      description: 'The currently selected rows. Two-way bindable.',
    },
    {
      name: 'filterable',
      type: 'boolean',
      default: 'false',
      description: "Shows a global search box that filters rows client-side across every column's field value.",
    },
    {
      name: 'filterPlaceholder',
      type: 'string',
      default: "'Search...'",
      description: 'Placeholder text for the filter box.',
    },
    {
      name: 'lazy',
      type: 'boolean',
      default: 'false',
      description:
        'Hands filtering, sorting and paging to the caller. The table renders data untouched, takes its page count from totalRecords, and reports what to fetch through lazyLoad.',
    },
    {
      name: 'totalRecords',
      type: 'number | null',
      default: 'null',
      description:
        'How many rows exist in total on the server. Only read when lazy is set -- it is what the page count and summary are computed from, since data holds one page.',
    },
    {
      name: 'page',
      type: 'number',
      default: '1',
      description: 'The current 1-based page. Two-way bindable, so it can be restored from a URL or reset from outside.',
    },
    {
      name: 'sortField / sortDirection',
      type: "string / 'asc' | 'desc' | null",
      default: "'' / null",
      description: 'The active sort. Two-way bindable; set them to seed or restore a sort.',
    },
    {
      name: 'filterValue',
      type: 'string',
      default: "''",
      description: 'The global filter text. Two-way bindable, so it can be seeded or cleared from outside.',
    },
    {
      name: 'paginated',
      type: 'boolean',
      default: 'false',
      description: 'Enables pagination in the footer.',
    },
    {
      name: 'pageSize',
      type: 'number',
      default: '10',
      description: 'Rows per page. Two-way bindable -- the rows-per-page dropdown (when rowsPerPageOptions is set) writes back to it directly.',
    },
    {
      name: 'rowsPerPageOptions',
      type: 'readonly number[]',
      default: '[]',
      description: 'Shows a rows-per-page dropdown in the footer when non-empty, e.g. [5, 10, 25, 50].',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows a loading row (default spinner + "Loading...", or the #loading template) instead of the data rows.',
    },
    {
      name: 'striped',
      type: 'boolean',
      default: 'false',
      description: 'Alternates row background color on even rows.',
    },
    {
      name: 'showGridlines',
      type: 'boolean',
      default: 'false',
      description: 'Adds a vertical rule between columns, in addition to the row separators already shown.',
    },
    {
      name: 'stickyHeader',
      type: 'boolean',
      default: 'false',
      description: 'Pins the header row to the top of the scroll container.',
    },
    {
      name: 'emptyMessage',
      type: 'string',
      default: "'No data available'",
      description: 'Message shown when there are no rows to display.',
    },
    {
      name: 'showSummary',
      type: 'boolean',
      default: 'false',
      description: 'Shows a "Showing X to Y of Z entries" summary in the footer.',
    },
    {
      name: 'summaryTemplate',
      type: 'string',
      default: "'Showing {first} to {last} of {total} entries'",
      description: 'Template string for the summary text, with {first}/{last}/{total} placeholders.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'rowClick',
      type: 'EventEmitter<T>',
      description: 'Emitted with the clicked row, regardless of selectionMode.',
    },
    {
      name: 'lazyLoad',
      type: 'EventEmitter<TableLazyLoadEvent>',
      description:
        'Only while lazy is set: once on init, then on every page, page-size, sort or filter change. Carries { first, rows, page, sortField, sortDirection, filter } -- everything needed to fetch that page. Fires per filter keystroke, so debounce in the handler if each becomes a request.',
    },
    {
      name: 'sortChange',
      type: 'EventEmitter<TableSortEvent>',
      description: 'Emitted after a sortable header is clicked, with { field, direction }. direction is null when the column cycles back to unsorted.',
    },
    {
      name: 'pageChange',
      type: 'EventEmitter<number>',
      description: 'The two-way page model. Emitted with the new 1-based page whenever the user pages.',
    },
    {
      name: 'pageSizeChange',
      type: 'EventEmitter<number>',
      description: 'The two-way pageSize model. Emitted when the rows-per-page dropdown changes.',
    },
    {
      name: 'filterValueChange',
      type: 'EventEmitter<string>',
      description: 'The two-way filterValue model. Emitted as the user types in the filter box.',
    },
    {
      name: 'sortFieldChange / sortDirectionChange',
      type: 'EventEmitter<string> / EventEmitter<SortDirection>',
      description: 'The two-way sort models, emitted alongside sortChange. Bind them to restore a sort from a URL.',
    },
    {
      name: 'selectionChange',
      type: 'EventEmitter<T[]>',
      description: 'The two-way selection model. Emitted whenever rows are selected or deselected.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-striped', description: "Present on .s-table when striped is set." },
    { name: 'data-gridlines', description: 'Present on .s-table when showGridlines is set.' },
    { name: 'data-sticky', description: 'Present on .s-table__head when stickyHeader is set.' },
    { name: 'data-selected', description: 'Present on a .s-table__tr row when it is selected.' },
    { name: 'data-has-extras', description: '(rare) Present on .s-table__footer when it has a summary, rows-per-page dropdown, or #footer template, spacing pagination to one side instead of centering it.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-table__toolbar', description: 'Row above the table holding the filter box and/or #header template.' },
    { name: '.s-table__filter', description: 'Wrapper around the filter s-text-input.' },
    { name: '.s-table__scroll', description: 'Horizontally scrollable, bordered container around the table element.' },
    { name: '.s-table', description: 'The table element itself.' },
    { name: '.s-table__head', description: 'The header row group.' },
    { name: '.s-table__th', description: 'A header cell; .s-table__th--sortable / .s-table__th--checkbox are variants.' },
    { name: '.s-table__th-content', description: "Wraps a header cell's label and sort icon." },
    { name: '.s-table__sort-icon', description: 'The per-column sort chevron; --active and --desc modifiers indicate state.' },
    { name: '.s-table__td', description: 'A body cell; .s-table__td--checkbox is the selection-column variant.' },
    { name: '.s-table__tr', description: 'A body row; .s-table__tr--clickable is added when selectionMode is not none.' },
    { name: '.s-table__state-row', description: 'The single full-width row used for the loading or empty state.' },
    { name: '.s-table__loading', description: 'The default loading indicator (spinner + text).' },
    { name: '.s-table__loading-icon', description: 'The spinning loading icon.' },
    { name: '.s-table__empty', description: 'The empty-state message container.' },
    { name: '.s-table__footer', description: 'Footer row holding the summary, pagination, rows-per-page, and #footer template.' },
    { name: '.s-table__summary', description: 'The "Showing X to Y of Z entries" text.' },
    { name: '.s-table__footer-end', description: 'Wraps the rows-per-page dropdown and #footer template together.' },
    { name: '.s-table__rows-per-page', description: 'The rows-per-page label + select group.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-table-border', description: 'Border color of the scroll container and cell bottom borders.' },
    { name: '--semiui-comp-table-radius', description: 'Corner radius of the scroll container.' },
    { name: '--semiui-comp-table-font-size', description: 'Base font size for the table, summary, and rows-per-page text.' },
    { name: '--semiui-comp-table-header-background', description: 'Header row background.' },
    { name: '--semiui-comp-table-header-foreground', description: 'Header cell text color.' },
    { name: '--semiui-comp-table-header-font-weight', description: 'Weight of a header cell. Tree Table reads this too -- its header is the same header.' },
    {
      name: '--semiui-comp-table-row-background',
      description:
        "A body row's own fill, underneath the three state layers below. Transparent by default, so rows show whatever surface the table sits on; set it to the page background for opaque rows.",
    },
    { name: '--semiui-comp-table-row-foreground', description: 'Body cell text color. Header cells use header-foreground.' },
    { name: '--semiui-comp-table-row-background-striped', description: 'Even-row background when striped is set. Overrides row-background, and is overridden by hover and selection.' },
    { name: '--semiui-comp-table-row-background-hover', description: 'Row background on hover. Note that Semi points this and the striped background at the same {muted}, so give them different values to see hover feedback on a striped table.' },
    { name: '--semiui-comp-table-row-background-selected', description: 'Row background when selected -- the topmost of the four row layers, so a selected row stays visible while hovered.' },
    { name: '--semiui-comp-table-cell-padding-x', description: 'Horizontal cell padding, header and body.' },
    { name: '--semiui-comp-table-cell-padding-y', description: 'Vertical cell padding, header and body.' },
    { name: '--semiui-comp-table-sort-icon-color', description: 'Sort icon color when the column is unsorted.' },
    { name: '--semiui-comp-table-sort-icon-color-active', description: 'Sort icon color for the currently sorted column.' },
    { name: '--semiui-comp-table-sort-icon-size', description: 'Sort icon width and height.' },
    { name: '--semiui-comp-table-checkbox-column-width', description: 'Width of the leading selection column, when selectionMode renders one.' },
    { name: '--semiui-comp-table-filter-max-width', description: "How wide the toolbar's filter field is allowed to grow." },
    { name: '--semiui-comp-table-rows-per-page-width', description: "Width of the footer's rows-per-page Select." },
  ];
}

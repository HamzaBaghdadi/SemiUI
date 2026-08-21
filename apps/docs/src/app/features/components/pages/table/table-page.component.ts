import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TableColumn, TableComponent } from '../../../../components/table/table.component';
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

  protected statusVariant(status: Person['status']): 'primary' | 'default' | 'destructive' {
    if (status === 'active') return 'primary';
    if (status === 'invited') return 'default';
    return 'destructive';
  }

  toggleLoading(): void {
    this.isLoadingDemo.update((value) => !value);
  }

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
    { name: '--semiui-comp-table-cell-padding-x', description: 'Horizontal cell padding, header and body.' },
    { name: '--semiui-comp-table-cell-padding-y', description: 'Vertical cell padding, header and body.' },
    { name: '--semiui-comp-table-sort-icon-color', description: 'Sort icon color when the column is unsorted.' },
    { name: '--semiui-comp-table-sort-icon-color-active', description: 'Sort icon color for the currently sorted column.' },
    { name: '--semiui-comp-table-row-background-striped', description: 'Even-row background when striped is set.' },
    { name: '--semiui-comp-table-row-background-hover', description: 'Row background on hover.' },
    { name: '--semiui-comp-table-row-background-selected', description: 'Row background when selected.' },
  ];
}

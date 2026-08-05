import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TableColumn, TableComponent } from '../../../../components/table/table.component';
import { TagComponent } from '../../../../components/tag/tag.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

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
    { field: 'age', header: 'Age', sortable: true, align: 'right', width: '5rem' },
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
}

import { Component, signal } from '@angular/core';
import { TableColumn, TableComponent } from '../../table/table.component';
import { TagComponent } from '../../tag/tag.component';

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
  selector: 'app-table-docs-page',
  imports: [TableComponent, TagComponent],
  templateUrl: './table-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class TableDocsPage {
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
  protected loading = signal(false);

  protected statusVariant(status: Person['status']): 'primary' | 'default' | 'destructive' {
    if (status === 'active') return 'primary';
    if (status === 'invited') return 'default';
    return 'destructive';
  }

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }
}

import { Component, input } from '@angular/core';

export interface ApiPropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface ApiEventRow {
  name: string;
  type: string;
  description: string;
}

/** Renders a component's props and events as tables -- the API tab's content on every component page. */
@Component({
  selector: 'app-api-table',
  templateUrl: './api-table.component.html',
  styleUrl: './api-table.component.css',
})
export class ApiTableComponent {
  props = input<readonly ApiPropRow[]>([]);
  events = input<readonly ApiEventRow[]>([]);
}

import { Component, signal } from '@angular/core';
import { CalendarEvent, FullCalendarComponent } from '../../../../components/full-calendar/full-calendar.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

function daysFromToday(offset: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

@Component({
  selector: 'app-full-calendar-page',
  imports: [
    FullCalendarComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './full-calendar-page.component.html',
  styleUrl: './full-calendar-page.component.css',
})
export class FullCalendarPageComponent {
  protected readonly events: CalendarEvent[] = [
    { title: 'Standup', start: daysFromToday(0), color: 'info' },
    { title: 'Design review', start: daysFromToday(0), color: 'help' },
    { title: 'Ship v0.6', start: daysFromToday(0), color: 'success' },
    { title: 'Deep work', start: daysFromToday(0), color: 'secondary' },
    { title: '1:1 with manager', start: daysFromToday(1) },
    { title: 'Sprint planning', start: daysFromToday(2), end: daysFromToday(2), color: 'warn' },
    { title: 'Conference', start: daysFromToday(4), end: daysFromToday(6), color: 'danger' },
    { title: 'Team lunch', start: daysFromToday(-2), color: 'success' },
  ];

  protected readonly log = signal('');

  onDayClick(date: Date): void {
    this.log.set(`Day clicked: ${date.toLocaleDateString()}`);
  }

  onEventClick(event: CalendarEvent): void {
    this.log.set(`Event clicked: ${event.title}`);
  }

  protected readonly basicCode = `protected events = [
  { title: 'Standup', start: new Date(2026, 1, 10), color: 'info' },
  { title: 'Sprint planning', start: new Date(2026, 1, 12), color: 'warn' },
  { title: 'Conference', start: new Date(2026, 1, 14), end: new Date(2026, 1, 16), color: 'danger' },
];

<s-full-calendar [events]="events" (dayClick)="onDayClick($event)" (eventClick)="onEventClick($event)" />`;

  protected readonly weekCode = `<s-full-calendar [events]="events" view="week" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'events',
      type: 'readonly CalendarEvent[]',
      default: '[]',
      description: 'CalendarEvent: { title: string; start: Date; end?: Date; color?: Severity }. end defaults to start (a single-day event).',
    },
    {
      name: 'view',
      type: "'month' | 'week'",
      default: "'month'",
      description: 'The active view. Two-way bindable.',
    },
    {
      name: 'maxEventsPerDay',
      type: 'number',
      default: '3',
      description: "Events shown per day in month view before collapsing into a \"+N more\" count.",
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    { name: 'dayClick', type: 'EventEmitter<Date>', description: 'Emitted when an empty part of a day cell is clicked.' },
    { name: 'eventClick', type: 'EventEmitter<CalendarEvent>', description: 'Emitted when an event pill is clicked.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-full-calendar__header', description: 'The nav/title/view-switch row.' },
    { name: '.s-full-calendar__grid', description: 'The 7-column day grid.' },
    { name: '.s-full-calendar__cell', description: 'A single day cell.' },
    { name: '.s-full-calendar__cell--today', description: "Applied to today's cell." },
    { name: '.s-full-calendar__cell--outside', description: "Applied to a leading/trailing day from an adjacent month (month view only)." },
    { name: '.s-full-calendar__event', description: 'A single event pill.' },
    { name: '.s-full-calendar__event-more', description: 'The "+N more" overflow count.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-table-*', description: "Reused for the grid's borders, header row, and hover color -- a calendar grid is structurally close to a table." },
    { name: '--semiui-comp-button-variants-*-background', description: "Reused for an event's color, via --s-full-calendar-event-color." },
    { name: '--semiui-color-primary', description: "Today's day-number badge, and the active view-switch tab." },
  ];
}

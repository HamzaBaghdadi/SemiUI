import { Component, computed, input, model, output, signal } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { Severity } from '@semiui/tokens';
import { injectSemiUIIcons } from '@semiui/theme';

export interface CalendarEvent {
  title: string;
  start: Date;
  /** Defaults to `start` (a single-day event) when omitted. */
  end?: Date;
  /** Points the event pill at one of Button's own variant tokens instead of the default primary. */
  color?: Severity;
}

export type FullCalendarView = 'month' | 'week';

interface CalendarCell<TEvent> {
  date: Date;
  outsideMonth: boolean;
  events: TEvent[];
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

/**
 * A month/week calendar grid with events: pass `events` (each just needs `title` and `start`).
 * Month view shows up to `maxEventsPerDay` pills per day plus a "+N more" count (not itself
 * interactive -- a full popover listing the overflow would be the natural next step, kept out of
 * this component to bound its scope); week view lists every event per day in an agenda-style
 * column, not an hour-by-hour time grid. Purely a display/navigation component -- it has no
 * concept of a "selected" date/event or of creating/editing events; `dayClick`/`eventClick` hand
 * both back to the consumer to act on (open a dialog, navigate, etc).
 */
@Component({
  selector: 's-full-calendar',
  imports: [SIconComponent],
  templateUrl: './full-calendar.component.html',
  styleUrl: './full-calendar.component.css',
  host: {
    class: 's-full-calendar',
    '[attr.data-view]': 'view()',
  },
})
export class FullCalendarComponent<TEvent extends CalendarEvent = CalendarEvent> {
  protected readonly icons = injectSemiUIIcons();

  events = input<readonly TEvent[]>([]);
  /** The active view. Two-way bindable. */
  view = model<FullCalendarView>('month');
  /** Events shown per day in month view before collapsing into a "+N more" count. */
  maxEventsPerDay = input(3);

  /** Emitted when an empty part of a day cell is clicked -- e.g. to open an "add event" flow. */
  dayClick = output<Date>();
  /** Emitted when an event pill is clicked. */
  eventClick = output<TEvent>();

  protected readonly viewDate = signal(startOfDay(new Date()));

  protected readonly weekdayLabels = computed(() => {
    const sunday = addDays(startOfDay(new Date()), -new Date().getDay());
    return Array.from({ length: 7 }, (_, i) => addDays(sunday, i).toLocaleDateString(undefined, { weekday: 'short' }));
  });

  protected readonly monthCells = computed<CalendarCell<TEvent>[]>(() => this.buildMonthCells(this.viewDate()));
  protected readonly weekCells = computed<CalendarCell<TEvent>[]>(() => this.buildWeekCells(this.viewDate()));

  protected readonly visibleRangeLabel = computed(() => {
    if (this.view() === 'month') {
      return this.viewDate().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    const week = this.weekCells();
    const start = week[0].date;
    const end = week[6].date;
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString(undefined, { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  });

  protected isToday(date: Date): boolean {
    return sameDay(date, new Date());
  }

  protected previous(): void {
    this.viewDate.update((d) => (this.view() === 'month' ? addMonths(d, -1) : addDays(d, -7)));
  }

  protected next(): void {
    this.viewDate.update((d) => (this.view() === 'month' ? addMonths(d, 1) : addDays(d, 7)));
  }

  protected today(): void {
    this.viewDate.set(startOfDay(new Date()));
  }

  protected onDayClick(date: Date): void {
    this.dayClick.emit(date);
  }

  protected onEventClick(event: TEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    this.eventClick.emit(event);
  }

  protected eventColorVar(event: TEvent): string | null {
    return event.color ? `var(--semiui-comp-button-variants-${event.color}-background)` : null;
  }

  private eventsForDay(date: Date): TEvent[] {
    const day = startOfDay(date).getTime();
    return this.events()
      .filter((event) => {
        const start = startOfDay(event.start).getTime();
        const end = startOfDay(event.end ?? event.start).getTime();
        return day >= start && day <= end;
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  private buildMonthCells(anchor: Date): CalendarCell<TEvent>[] {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Date[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push(addDays(firstOfMonth, -i - 1));
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    while (days.length % 7 !== 0) {
      days.push(addDays(days[days.length - 1], 1));
    }
    return days.map((date) => ({ date, outsideMonth: date.getMonth() !== month, events: this.eventsForDay(date) }));
  }

  private buildWeekCells(anchor: Date): CalendarCell<TEvent>[] {
    const start = addDays(anchor, -anchor.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return { date, outsideMonth: false, events: this.eventsForDay(date) };
    });
  }
}

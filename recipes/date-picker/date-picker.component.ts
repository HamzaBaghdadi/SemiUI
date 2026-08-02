import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { BaseFormFieldControl } from '@zaytoon/primitives/form-field';
import { injectZaytoonIcons } from '@zaytoon/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export interface CalendarDay {
  date: Date;
  outsideMonth: boolean;
}

const PANEL_SPACE_ESTIMATE_PX = 340;

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

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

let nextDatePickerId = 0;

/**
 * A calendar date picker: a text field that opens a viewport-aware calendar panel, or the
 * calendar rendered directly with `inline` (no input, no popover, always visible). Supports
 * ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl`. Keyboard navigation
 * follows the standard grid pattern: arrow keys move by day, Home/End jump to the start/end of the
 * week, PageUp/PageDown change month, Enter/Space selects.
 */
@Component({
  selector: 'z-date-picker',
  imports: [ZIconComponent, ErrorMessageComponent, NgTemplateOutlet],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
    '[attr.data-inline]': 'inline() ? \'\' : null',
  },
})
export class DatePickerComponent extends BaseFormFieldControl<Date | null> {
  protected readonly icons = injectZaytoonIcons();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly triggerInput = viewChild<ElementRef<HTMLInputElement>>('triggerInput');
  private readonly grid = viewChild<ElementRef<HTMLDivElement>>('grid');

  placeholder = input('Pick a date');
  errorMessage = input('');
  /** Renders the calendar directly, with no trigger input or popover. */
  inline = input(false, { transform: booleanAttribute });
  clearable = input(true, { transform: booleanAttribute });
  minDate = input<Date>();
  maxDate = input<Date>();
  /** Additional per-date disable predicate, checked alongside min/max. */
  isDateDisabled = input<(date: Date) => boolean>(() => false);
  dateFormat = input<(date: Date) => string>((date) => date.toLocaleDateString());

  protected readonly listboxId = `z-date-picker-grid-${nextDatePickerId++}`;
  protected readonly open = signal(false);
  protected readonly panelPlacement = signal<'top' | 'bottom'>('bottom');
  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly focusedDate = signal<Date>(new Date());

  protected readonly calendarDays = computed<CalendarDay[]>(() => this.buildCalendarDays(this.viewYear(), this.viewMonth()));
  protected readonly monthLabel = computed(() =>
    new Date(this.viewYear(), this.viewMonth(), 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
  );
  protected readonly displayValue = computed(() => {
    const value = this.value();
    return value ? this.dateFormat()(value) : '';
  });
  protected readonly showClear = computed(() => this.clearable() && !this.effectiveDisabled() && this.value() !== null);

  /** Keeps the visible month in sync with the bound value -- fires on the initial CVA-pushed value too, not just user clicks. */
  private readonly syncViewToValue = effect(() => {
    const value = this.value();
    if (value) {
      this.viewYear.set(value.getFullYear());
      this.viewMonth.set(value.getMonth());
      this.focusedDate.set(value);
    }
  });

  /** Moves DOM focus to whichever day button matches `focusedDate` after the grid re-renders (roving tabindex). */
  private readonly focusActiveDay = afterRenderEffect(() => {
    const focused = this.focusedDate();
    if (!this.open() && !this.inline()) {
      return;
    }
    const gridEl = this.grid()?.nativeElement;
    const button = gridEl?.querySelector<HTMLButtonElement>(`[data-date-key="${dateKey(focused)}"]`);
    button?.focus();
  });

  protected override emptyValue(): Date | null {
    return null;
  }

  focus(options?: FocusOptions): void {
    this.triggerInput()?.nativeElement.focus(options);
  }

  protected toggle(): void {
    if (this.effectiveDisabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected openPanel(): void {
    this.open.set(true);
    this.updatePlacement();
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.handleBlur();
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.effectiveDisabled()) {
      return;
    }
    this.value.set(null);
    this.close();
  }

  protected isDayDisabled(date: Date): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    if (min && date < startOfDay(min)) {
      return true;
    }
    if (max && date > startOfDay(max)) {
      return true;
    }
    return this.isDateDisabled()(date);
  }

  protected isSelected(date: Date): boolean {
    const value = this.value();
    return value !== null && sameDay(date, value);
  }

  protected isToday(date: Date): boolean {
    return sameDay(date, new Date());
  }

  protected isFocused(date: Date): boolean {
    return sameDay(date, this.focusedDate());
  }

  protected dateKey(date: Date): string {
    return dateKey(date);
  }

  protected selectDay(day: CalendarDay): void {
    if (this.isDayDisabled(day.date)) {
      return;
    }
    this.value.set(day.date);
    this.focusedDate.set(day.date);
    if (!this.inline()) {
      this.close();
      this.triggerInput()?.nativeElement.focus();
    } else {
      this.handleBlur();
    }
  }

  protected previousMonth(): void {
    const month = this.viewMonth();
    if (month === 0) {
      this.viewMonth.set(11);
      this.viewYear.update((year) => year - 1);
    } else {
      this.viewMonth.set(month - 1);
    }
  }

  protected nextMonth(): void {
    const month = this.viewMonth();
    if (month === 11) {
      this.viewMonth.set(0);
      this.viewYear.update((year) => year + 1);
    } else {
      this.viewMonth.set(month + 1);
    }
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const current = this.focusedDate();
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowRight':
        next = addDays(current, 1);
        break;
      case 'ArrowLeft':
        next = addDays(current, -1);
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        break;
      case 'ArrowUp':
        next = addDays(current, -7);
        break;
      case 'Home':
        next = addDays(current, -current.getDay());
        break;
      case 'End':
        next = addDays(current, 6 - current.getDay());
        break;
      case 'PageUp':
        next = addMonths(current, -1);
        break;
      case 'PageDown':
        next = addMonths(current, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDay({ date: current, outsideMonth: false });
        return;
      default:
        return;
    }
    event.preventDefault();
    this.focusedDate.set(next);
    if (next.getMonth() !== this.viewMonth() || next.getFullYear() !== this.viewYear()) {
      this.viewYear.set(next.getFullYear());
      this.viewMonth.set(next.getMonth());
    }
  }

  private buildCalendarDays(year: number, month: number): CalendarDay[] {
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({ date: addDays(firstOfMonth, -i - 1), outsideMonth: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), outsideMonth: false });
    }
    while (days.length % 7 !== 0) {
      days.push({ date: addDays(days[days.length - 1].date, 1), outsideMonth: true });
    }
    return days;
  }

  /**
   * Picks which side of the trigger the panel opens on, based on available viewport space.
   * Known limitation: only accounts for the viewport, not an `overflow: hidden` ancestor.
   */
  private updatePlacement(): void {
    const trigger = this.triggerInput()?.nativeElement;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    this.panelPlacement.set(spaceBelow < PANEL_SPACE_ESTIMATE_PX && spaceAbove > spaceBelow ? 'top' : 'bottom');
  }

  /**
   * Handles Escape regardless of which element inside the panel currently has focus -- the
   * trigger input's own keydown and the day grid's keydown only fire for focus that's already
   * inside THOSE specific elements, so pressing Escape while a nav button (prev/next month) is
   * focused would otherwise do nothing at all.
   */
  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    if (this.open() && !this.inline()) {
      this.close();
      this.triggerInput()?.nativeElement.focus();
    }
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (this.open()) {
      this.updatePlacement();
    }
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (this.open()) {
      this.updatePlacement();
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.inline() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}

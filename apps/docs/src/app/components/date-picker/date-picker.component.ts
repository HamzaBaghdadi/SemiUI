import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  TemplateRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { injectSemiUIIcons } from '@semiui/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export interface CalendarDay {
  date: Date;
  outsideMonth: boolean;
}

const PANEL_SPACE_ESTIMATE_PX = 340;
/** Not a token -- matches the common small-viewport cutoff (Tailwind's `sm`) used as a default elsewhere in the ecosystem; there's no design-system breakpoint to reuse here. */
const MOBILE_BREAKPOINT_PX = 640;

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

/** Best-effort fallback parser for manual text entry -- good enough for locale-formatted dates like "8/2/2026" or ISO strings; pass a custom `parseDate` for anything stricter. */
function defaultParseDate(text: string): Date | null {
  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/** Identity for the unset `isDateDisabled` input -- a stable reference so isMonthDisabled/isYearDisabled can skip their expensive per-day fallback loop when the caller never supplied one. */
function noDateDisabled(): boolean {
  return false;
}

export type DatePickerTimeFormat = '12h' | '24h';
export type DatePickerSelectionMode = 'single' | 'multiple' | 'range';

export interface DateRange {
  start: Date;
  /** Null while only the start has been picked -- a range in progress. */
  end: Date | null;
}

let nextDatePickerId = 0;

/**
 * A calendar date picker: a text field that opens a viewport-aware calendar panel, or the
 * calendar rendered directly with `inline` (no input, no popover, always visible). Supports
 * ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl` for the default
 * `selectionMode="single"`. Keyboard navigation follows the standard grid pattern: arrow keys move
 * by day, Home/End jump to the start/end of the week, PageUp/PageDown change month, Enter/Space
 * selects.
 *
 * `selectionMode="multiple"` / `"range"` bind through separate `multipleValue` / `rangeValue`
 * two-way signals instead of `value` -- they're plain `model()`s, not routed through the
 * ControlValueAccessor `BaseFormFieldControl` uses, so ngModel/formControl/Signal Forms integration
 * is only available for the default single mode.
 */
@Component({
  selector: 's-date-picker',
  imports: [SIconComponent, ErrorMessageComponent, NgTemplateOutlet],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  host: {
    '[attr.data-open]': 'open() ? \'\' : null',
    '[attr.data-inline]': 'inline() ? \'\' : null',
  },
})
export class DatePickerComponent extends BaseFormFieldControl<Date | null> {
  protected readonly icons = injectSemiUIIcons();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly triggerInput = viewChild<ElementRef<HTMLInputElement>>('triggerInput');
  private readonly grid = viewChild<ElementRef<HTMLDivElement>>('grid');
  private readonly yearsPanel = viewChild<ElementRef<HTMLDivElement>>('yearsPanel');

  placeholder = input('Pick a date');
  errorMessage = input('');
  /** Renders the calendar directly, with no trigger input or popover. */
  inline = input(false, { transform: booleanAttribute });
  clearable = input(true, { transform: booleanAttribute });
  minDate = input<Date>();
  maxDate = input<Date>();
  /** Additional per-date disable predicate, checked alongside min/max. */
  isDateDisabled = input<(date: Date) => boolean>(noDateDisabled);
  /** Formats the trigger's displayed text. Defaults to a locale date (or date+time / time-only string, depending on showTime/timeOnly) if omitted. */
  dateFormat = input<(date: Date) => string>();
  /** Shows a "Today" button in the panel footer that jumps to and selects the current date. */
  showTodayButton = input(false, { transform: booleanAttribute });
  /** Adds hour/minute controls below the calendar; the picked day and time combine into one Date. */
  showTime = input(false, { transform: booleanAttribute });
  timeFormat = input<DatePickerTimeFormat>('24h');
  /** Hides the calendar entirely, showing just the time controls -- implies showTime. */
  timeOnly = input(false, { transform: booleanAttribute });
  /** Lets the trigger be typed into directly instead of only opened by click; committed on blur/Enter via `parseDate`. */
  manualInput = input(false, { transform: booleanAttribute });
  /** Parses manually-typed text into a Date, or null if unparseable. Defaults to `new Date(text)`. */
  parseDate = input<(text: string) => Date | null>(defaultParseDate);
  /** "single" (default, via `value`) / "multiple" (via `multipleValue`) / "range" (via `rangeValue`). */
  selectionMode = input<DatePickerSelectionMode>('single');
  /** Bound when `selectionMode="multiple"`. Two-way bindable; clicking a day toggles it in/out. */
  multipleValue = model<Date[]>([]);
  /** Bound when `selectionMode="range"`. Two-way bindable; `end` is null while a range is still in progress. */
  rangeValue = model<DateRange | null>(null);
  /** Below MOBILE_BREAKPOINT_PX, renders the year list inline in the main panel (swapped in like the month grid) instead of as a floating side panel -- a side panel that can spill outside a narrow viewport is unusable there. Defaults `true` since a floating side panel is rarely what you want on a phone; set `false` to keep the floating panel at every width. No effect at all if `inlineYears` is already forcing inline everywhere. */
  inlineYearsOnMobile = input(true, { transform: booleanAttribute });
  /** Forces the year list inline in the main panel (like the month grid) on every viewport, never as a floating side panel. Takes priority over `inlineYearsOnMobile`. */
  inlineYears = input(false, { transform: booleanAttribute });

  /** Rendered above the calendar, inside the panel. */
  protected headerTemplate = contentChild<unknown, TemplateRef<unknown>>('header', { read: TemplateRef });
  /** Rendered below the calendar (and the Today button, if shown), inside the panel. */
  protected footerTemplate = contentChild<unknown, TemplateRef<unknown>>('footer', { read: TemplateRef });

  protected readonly listboxId = `s-date-picker-grid-${nextDatePickerId++}`;
  protected readonly open = signal(false);
  protected readonly panelPlacement = signal<'top' | 'bottom'>('bottom');
  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly focusedDate = signal<Date>(new Date());
  /** Which level of the header's drill-down navigation is showing in the main panel -- the days grid, a 12-month grid to jump within the year, or (only when `yearsInline()`) the year list swapped in the same way. Year picking is normally its own side panel (yearsPanelOpen) instead of a level here. */
  protected readonly navView = signal<'days' | 'months' | 'years'>('days');
  /** A scrollable year list shown as its own panel beside the main one, toggled by the header's year button -- not swapped in place, so the main panel never resizes when jumping years. Stays false whenever `yearsInline()` is in effect; that mode drives the years grid through `navView` instead. */
  protected readonly yearsPanelOpen = signal(false);
  /** Tracks the viewport for `inlineYearsOnMobile`; updated on resize. */
  protected readonly isMobileViewport = signal(window.innerWidth <= MOBILE_BREAKPOINT_PX);
  /** Whether the year list should render inline in the main panel instead of as a floating side panel -- forced on by `inlineYears`, or by `inlineYearsOnMobile` (the default) while the viewport is narrow. */
  protected readonly yearsInline = computed(() => this.inlineYears() || (this.inlineYearsOnMobile() && this.isMobileViewport()));
  /** Internal 24-hour representation, regardless of `timeFormat` (which only affects display). */
  protected readonly viewHour = signal(new Date().getHours());
  protected readonly viewMinute = signal(new Date().getMinutes());

  protected readonly calendarDays = computed<CalendarDay[]>(() => this.buildCalendarDays(this.viewYear(), this.viewMonth()));
  /** Month name only -- the header shows month and year as two separate buttons, not one combined label. */
  protected readonly monthOnlyLabel = computed(() =>
    new Date(this.viewYear(), this.viewMonth(), 1).toLocaleDateString(undefined, { month: 'long' }),
  );
  protected readonly monthNames = computed(() =>
    Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(undefined, { month: 'short' })),
  );
  /** A wide, continuously-scrollable range (current year ±100) rather than a paginated 12-year grid. */
  protected readonly yearsListItems = computed(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 201 }, (_, i) => current - 100 + i);
  });
  /** 12 -> "12", 13 -> "1", 0 (unused internally, hours are 0-23) -- the hour shown in the 12h controls. */
  protected readonly hour12 = computed(() => {
    const h = this.viewHour() % 12;
    return h === 0 ? 12 : h;
  });
  protected readonly period = computed<'AM' | 'PM'>(() => (this.viewHour() < 12 ? 'AM' : 'PM'));
  private readonly timeFormatOptions = computed<Intl.DateTimeFormatOptions>(() => ({
    hour: '2-digit',
    minute: '2-digit',
    hour12: this.timeFormat() === '12h',
  }));
  private formatOne(date: Date): string {
    const custom = this.dateFormat();
    if (custom) {
      return custom(date);
    }
    if (this.timeOnly()) {
      return date.toLocaleTimeString(undefined, this.timeFormatOptions());
    }
    if (this.showTime()) {
      // toLocaleString(undefined, options) only includes the date/time fields present in
      // `options` -- timeFormatOptions() only requests hour/minute, so passing it directly here
      // would silently drop the date portion. Concatenating the two locale strings instead.
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, this.timeFormatOptions())}`;
    }
    return date.toLocaleDateString();
  }

  protected readonly displayValue = computed(() => {
    switch (this.selectionMode()) {
      case 'multiple': {
        const dates = this.multipleValue();
        if (dates.length === 0) {
          return '';
        }
        if (dates.length <= 3) {
          return dates.map((d) => this.formatOne(d)).join(', ');
        }
        return `${dates.length} dates selected`;
      }
      case 'range': {
        const range = this.rangeValue();
        if (!range) {
          return '';
        }
        return range.end ? `${this.formatOne(range.start)} - ${this.formatOne(range.end)}` : `${this.formatOne(range.start)} - ...`;
      }
      default: {
        const value = this.value();
        return value ? this.formatOne(value) : '';
      }
    }
  });
  protected readonly showClear = computed(() => {
    if (this.effectiveDisabled() || !this.clearable()) {
      return false;
    }
    switch (this.selectionMode()) {
      case 'multiple':
        return this.multipleValue().length > 0;
      case 'range':
        return this.rangeValue() !== null;
      default:
        return this.value() !== null;
    }
  });

  /** Keeps the visible month (and time controls) in sync with the bound value -- fires on the initial CVA-pushed value too, not just user clicks. */
  private readonly syncViewToValue = effect(() => {
    const anchor = this.currentAnchorDate();
    if (anchor) {
      this.viewYear.set(anchor.getFullYear());
      this.viewMonth.set(anchor.getMonth());
      this.viewHour.set(anchor.getHours());
      this.viewMinute.set(anchor.getMinutes());
      this.focusedDate.set(anchor);
    }
  });

  /** The date to sync the visible month/focus to, for whichever selection mode is active. */
  private currentAnchorDate(): Date | null {
    switch (this.selectionMode()) {
      case 'multiple': {
        const dates = this.multipleValue();
        return dates.length > 0 ? dates[dates.length - 1] : null;
      }
      case 'range':
        return this.rangeValue()?.end ?? this.rangeValue()?.start ?? null;
      default:
        return this.value();
    }
  }

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

  /** Which year the years panel should open centered on: a picked date's year, else today's (if
   * pickable), else whichever enabled year sits closest to today -- never just the list's first
   * entry, which would strand the user 100 years back if, say, minDate rules out everything before
   * today. */
  protected readonly targetYear = computed(() => {
    const picked = this.pickedDates();
    if (picked.length > 0) {
      return picked[picked.length - 1].getFullYear();
    }
    return this.nearestEnabledYear(new Date().getFullYear()) ?? this.viewYear();
  });

  /** Expanding search outward from `year` (this year, then ±1, ±2, ...) for the closest year with at least one enabled day, bounded to the same ±100 range as yearsListItems. */
  private nearestEnabledYear(year: number): number | null {
    if (!this.isYearDisabled(year)) {
      return year;
    }
    for (let offset = 1; offset <= 100; offset++) {
      if (!this.isYearDisabled(year + offset)) {
        return year + offset;
      }
      if (!this.isYearDisabled(year - offset)) {
        return year - offset;
      }
    }
    return null;
  }

  /** Centers the years panel on targetYear() each time it opens, without animating -- a picker
   * that opens 60 years scrolled away from the selected year with no indication where to look is
   * worse than just jumping there instantly. Sets `scrollTop` directly rather than calling
   * `scrollIntoView` -- that walks up every scrollable ancestor (including the page itself) to
   * bring the target fully into view, so it was yanking the whole page's scroll position to center
   * the button, not just scrolling within the panel's own `overflow-y: auto` box. */
  private readonly scrollYearsPanelToTarget = afterRenderEffect(() => {
    if (!this.yearsPanelOpen() && this.navView() !== 'years') {
      return;
    }
    const year = this.targetYear();
    const panelEl = this.yearsPanel()?.nativeElement;
    const button = panelEl?.querySelector<HTMLButtonElement>(`[data-year="${year}"]`);
    if (!panelEl || !button) {
      return;
    }
    panelEl.scrollTop = button.offsetTop - panelEl.clientHeight / 2 + button.offsetHeight / 2;
  });

  protected override emptyValue(): Date | null {
    return null;
  }

  focus(options?: FocusOptions): void {
    this.triggerInput()?.nativeElement.focus(options);
  }

  /** `null` in `inline` mode -- there's no trigger at all, just the calendar grid, so there's
   * nothing sensible for autoFocus to focus. */
  protected override focusTarget(): HTMLElement | null {
    return this.inline() ? null : (this.triggerInput()?.nativeElement ?? null);
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
    this.resetViewToRelevantMonth();
    this.navView.set('days');
    this.yearsPanelOpen.set(false);
    this.open.set(true);
    this.updatePlacement();
  }

  /**
   * Jumps the visible month/year back to wherever's relevant, so reopening after navigating away
   * (without picking a date) doesn't strand the panel on some unrelated month: the selected value
   * if there is one, else minDate's month if minDate is in the future, else today.
   */
  private resetViewToRelevantMonth(): void {
    const base = this.currentAnchorDate() ?? this.defaultViewDate();
    this.viewYear.set(base.getFullYear());
    this.viewMonth.set(base.getMonth());
  }

  private defaultViewDate(): Date {
    const min = this.minDate();
    const today = new Date();
    return min && min > today ? min : today;
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
    switch (this.selectionMode()) {
      case 'multiple':
        this.multipleValue.set([]);
        break;
      case 'range':
        this.rangeValue.set(null);
        break;
      default:
        this.value.set(null);
    }
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

  /** Whether every day in `month` (0-11) of `year` is disabled -- min/max rule out the month outright when it falls entirely outside the range; otherwise, only bother walking its days if a custom `isDateDisabled` was actually supplied. */
  protected isMonthDisabled(year: number, month: number): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (min && new Date(year, month, daysInMonth) < startOfDay(min)) {
      return true;
    }
    if (max && new Date(year, month, 1) > startOfDay(max)) {
      return true;
    }
    if (this.isDateDisabled() === noDateDisabled) {
      return false;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      if (!this.isDayDisabled(new Date(year, month, d))) {
        return false;
      }
    }
    return true;
  }

  /** Whether every month in `year` is disabled -- same min/max fast path as isMonthDisabled, falling back to checking all 12 months only when a custom `isDateDisabled` is supplied. */
  protected isYearDisabled(year: number): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    if (min && new Date(year, 11, 31) < startOfDay(min)) {
      return true;
    }
    if (max && new Date(year, 0, 1) > startOfDay(max)) {
      return true;
    }
    if (this.isDateDisabled() === noDateDisabled) {
      return false;
    }
    for (let month = 0; month < 12; month++) {
      if (!this.isMonthDisabled(year, month)) {
        return false;
      }
    }
    return true;
  }

  /** Whether `date` is one of the picked days -- for single, the value; for multiple, any of them; for range, either endpoint. */
  protected isSelected(date: Date): boolean {
    switch (this.selectionMode()) {
      case 'multiple':
        return this.multipleValue().some((d) => sameDay(d, date));
      case 'range': {
        const range = this.rangeValue();
        return !!range && (sameDay(range.start, date) || (range.end !== null && sameDay(range.end, date)));
      }
      default: {
        const value = this.value();
        return value !== null && sameDay(date, value);
      }
    }
  }

  /** Every currently-picked date, across whichever selection mode is active -- the shared basis for isMonthSelected/isYearSelected below. */
  private pickedDates(): Date[] {
    switch (this.selectionMode()) {
      case 'multiple':
        return this.multipleValue();
      case 'range': {
        const range = this.rangeValue();
        if (!range) {
          return [];
        }
        return range.end ? [range.start, range.end] : [range.start];
      }
      default: {
        const value = this.value();
        return value ? [value] : [];
      }
    }
  }

  /**
   * Whether `month` (0-11) of `year` holds one of the actually-picked dates -- deliberately NOT
   * whether it's just the currently-browsed month. Using `viewMonth()` for this used to mean that
   * navigating (via the header's prev/next arrows) into a fully-disabled month -- which the days
   * grid already lets you browse into, even though nothing there is clickable -- highlighted that
   * month as "selected" in the months grid too, showing the contradictory combination of selected
   * and disabled on a month nothing was ever picked in.
   */
  protected isMonthSelected(year: number, month: number): boolean {
    return this.pickedDates().some((d) => d.getFullYear() === year && d.getMonth() === month);
  }

  /** Same rationale as isMonthSelected -- reflects an actual picked date's year, not the browsed one. */
  protected isYearSelected(year: number): boolean {
    return this.pickedDates().some((d) => d.getFullYear() === year);
  }

  protected isRangeStart(date: Date): boolean {
    const range = this.rangeValue();
    return !!range && sameDay(range.start, date);
  }

  protected isRangeEnd(date: Date): boolean {
    const range = this.rangeValue();
    return !!range && range.end !== null && sameDay(range.end, date);
  }

  /** Strictly between the range's endpoints (exclusive) -- for the connecting "in range" highlight. */
  protected isInRange(date: Date): boolean {
    const range = this.rangeValue();
    if (!range || !range.end) {
      return false;
    }
    const time = startOfDay(date).getTime();
    return time > startOfDay(range.start).getTime() && time < startOfDay(range.end).getTime();
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
    const picked = this.showTime() ? this.combineDateAndTime(day.date) : day.date;
    this.focusedDate.set(day.date);

    switch (this.selectionMode()) {
      case 'multiple':
        this.toggleMultipleDay(picked);
        return; // Panel stays open -- picking several dates is the point.
      case 'range':
        this.extendRange(picked);
        return; // extendRange decides whether the range is complete enough to close the panel.
      default:
        this.value.set(picked);
        this.closeAfterSingleSelection();
    }
  }

  private toggleMultipleDay(date: Date): void {
    const current = this.multipleValue();
    const existingIndex = current.findIndex((d) => sameDay(d, date));
    this.multipleValue.set(existingIndex >= 0 ? current.filter((_, i) => i !== existingIndex) : [...current, date]);
  }

  private extendRange(date: Date): void {
    const current = this.rangeValue();
    if (!current || current.end !== null) {
      // No range yet, or the previous range was already complete -- start a fresh one.
      this.rangeValue.set({ start: date, end: null });
      return;
    }
    // Picking the second date: keep start/end in chronological order regardless of click order.
    const range: DateRange = date < current.start ? { start: date, end: current.start } : { start: current.start, end: date };
    this.rangeValue.set(range);
    this.closeAfterSingleSelection();
  }

  private closeAfterSingleSelection(): void {
    if (!this.inline()) {
      // Leave the panel open when a time picker is showing, so picking a day doesn't immediately
      // close before the user's had a chance to also adjust the time.
      if (!this.showTime()) {
        this.close();
        this.triggerInput()?.nativeElement.focus();
      }
    } else {
      this.handleBlur();
    }
  }

  private combineDateAndTime(date: Date): Date {
    const result = new Date(date);
    result.setHours(this.viewHour(), this.viewMinute(), 0, 0);
    return result;
  }

  protected setHour(hour: number): void {
    if (hour < 0 || hour > 23) {
      return;
    }
    this.viewHour.set(hour);
    this.applyTimeChange();
  }

  protected setHour12(hour12: number): void {
    if (hour12 < 1 || hour12 > 12) {
      return;
    }
    const isPM = this.period() === 'PM';
    const hour24 = (hour12 % 12) + (isPM ? 12 : 0);
    this.setHour(hour24);
  }

  protected setMinute(minute: number): void {
    if (minute < 0 || minute > 59) {
      return;
    }
    this.viewMinute.set(minute);
    this.applyTimeChange();
  }

  protected togglePeriod(): void {
    this.setHour((this.viewHour() + 12) % 24);
  }

  /** Applies the currently-set hour/minute to the bound value -- immediately if one exists (or, in timeOnly mode, establishing today's date the first time a time is picked). */
  private applyTimeChange(): void {
    const current = this.value();
    if (current) {
      this.value.set(this.combineDateAndTime(current));
    } else if (this.timeOnly()) {
      this.value.set(this.combineDateAndTime(startOfDay(new Date())));
    }
  }

  protected onTriggerKeydownEnter(event: Event): void {
    if (this.manualInput()) {
      event.preventDefault();
      this.commitManualText((event.target as HTMLInputElement).value);
    } else {
      this.toggle();
    }
  }

  protected onTriggerBlur(event: FocusEvent): void {
    if (this.manualInput()) {
      this.commitManualText((event.target as HTMLInputElement).value);
    }
  }

  private commitManualText(text: string): void {
    const trimmed = text.trim();
    if (trimmed === '') {
      this.value.set(null);
      return;
    }
    const parsed = this.parseDate()(trimmed);
    if (parsed && !this.isDayDisabled(startOfDay(parsed))) {
      this.value.set(this.timeOnly() || this.showTime() ? parsed : startOfDay(parsed));
      return;
    }
    // Parse failed (or the date's disabled) -- revert the DOM to the last valid displayValue().
    // Angular's [value] binding won't repaint this on its own: displayValue() itself hasn't
    // changed since we never committed the bad input to `value`, so there's nothing to react to.
    const input = this.triggerInput()?.nativeElement;
    if (input) {
      input.value = this.displayValue();
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

  /** Header's "<" button: steps by month in the days view, by year in the months view. */
  protected navPrevious(): void {
    if (this.navView() === 'days') {
      this.previousMonth();
    } else {
      this.viewYear.update((year) => year - 1);
    }
  }

  /** Header's ">" button -- see navPrevious. */
  protected navNext(): void {
    if (this.navView() === 'days') {
      this.nextMonth();
    } else {
      this.viewYear.update((year) => year + 1);
    }
  }

  /** The header's month button: opens the 12-month grid in the main panel (same width, no resize). */
  protected openMonthsView(): void {
    this.navView.set('months');
    this.yearsPanelOpen.set(false);
  }

  /** The header's year button: normally opens the scrollable year list as its own side panel, leaving the main panel's content (and width) untouched -- but under `yearsInline()`, swaps the year list into the main panel instead, the same way `openMonthsView` does for months. */
  protected toggleYearsPanel(): void {
    if (this.yearsInline()) {
      this.navView.update((view) => (view === 'years' ? 'days' : 'years'));
      return;
    }
    this.yearsPanelOpen.update((open) => !open);
  }

  protected selectMonth(month: number): void {
    if (this.isMonthDisabled(this.viewYear(), month)) {
      return;
    }
    this.viewMonth.set(month);
    this.navView.set('days');
  }

  protected selectYear(year: number): void {
    if (this.isYearDisabled(year)) {
      return;
    }
    this.viewYear.set(year);
    if (this.yearsInline()) {
      this.navView.set('days');
    } else {
      this.yearsPanelOpen.set(false);
    }
  }

  protected goToToday(): void {
    const today = startOfDay(new Date());
    this.selectDay({ date: today, outsideMonth: false });
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
    this.isMobileViewport.set(window.innerWidth <= MOBILE_BREAKPOINT_PX);
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

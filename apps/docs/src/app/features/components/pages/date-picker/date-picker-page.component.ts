import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { DatePickerComponent, DateRange } from '../../../../components/date-picker/date-picker.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-date-picker-page',
  imports: [
    DatePickerComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    DatePipe,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './date-picker-page.component.html',
  styleUrl: './date-picker-page.component.css',
})
export class DatePickerPageComponent {
  // ngModel
  protected birthday: Date | null = null;
  protected disabled = signal(false);

  // min/max
  protected today = new Date();
  protected maxDate = new Date();
  protected minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  })();

  protected isWeekend = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;

  // Reactive forms
  protected reactiveForm = new FormGroup({
    appointment: new FormControl<Date | null>(null, Validators.required),
  });

  // Signal Forms
  protected profileModel = signal({ birthday: new Date(1995, 5, 15) });
  protected profileForm = form(this.profileModel);

  // Inline
  protected inlineDate: Date | null = new Date();

  // Custom format
  protected fmt = (date: Date): string => date.toISOString().slice(0, 10);

  // Multiple / range selection modes
  protected multipleDates: Date[] = [];
  protected dateRange: DateRange | null = null;

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-date-picker [(ngModel)]="birthday" placeholder="Pick your birthday" />`;

  protected readonly inlineCode = `<s-date-picker [(ngModel)]="date" [inline]="true" />`;

  protected readonly minMaxCode = `protected isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

<s-date-picker [(ngModel)]="date" [minDate]="minDate" [maxDate]="maxDate" [isDateDisabled]="isWeekend" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  appointment: new FormControl<Date | null>(null, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-date-picker formControlName="appointment" errorMessage="Please pick a date." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ birthday: new Date(1995, 5, 15) });
protected profileForm = form(this.profileModel);

<s-date-picker [formField]="profileForm.birthday" />`;

  protected readonly customFormatCode = `protected fmt = (date: Date) => date.toISOString().slice(0, 10); // "2026-08-02"

<s-date-picker [(ngModel)]="date" [dateFormat]="fmt" />`;

  protected readonly navigationCode = `<s-date-picker [showTodayButton]="true">
  <ng-template #header><strong>Pick a date</strong></ng-template>
</s-date-picker>`;

  protected readonly timeCode = `<s-date-picker [showTime]="true" />
<s-date-picker [showTime]="true" timeFormat="12h" />`;

  protected readonly timeOnlyManualCode = `<s-date-picker [timeOnly]="true" />
<s-date-picker [manualInput]="true" />`;

  protected readonly multipleRangeCode = `<s-date-picker selectionMode="multiple" [(multipleValue)]="multipleDates" />
<s-date-picker selectionMode="range" [(rangeValue)]="dateRange" />`;

  protected readonly inlineYearsCode = `<!-- Always inline, on any viewport -->
<s-date-picker [inlineYears]="true" />

<!-- Inline below the ~640px mobile breakpoint, floating side panel above it -- this is the default -->
<s-date-picker />

<!-- Opt back into a floating side panel even on mobile -->
<s-date-picker [inlineYearsOnMobile]="false" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'placeholder',
      type: 'string',
      default: "'Pick a date'",
      description: 'Placeholder text shown on the trigger input when no date is chosen.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the picker while invalid.',
    },
    {
      name: 'inline',
      type: 'boolean',
      default: 'false',
      description: 'Renders the calendar directly, with no trigger input or popover.',
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'true',
      description: 'Shows a clear ("x") button in the trigger once a value is picked.',
    },
    {
      name: 'minDate',
      type: 'Date',
      default: 'undefined',
      description: 'Earliest selectable date; earlier dates/months/years render disabled.',
    },
    {
      name: 'maxDate',
      type: 'Date',
      default: 'undefined',
      description: 'Latest selectable date; later dates/months/years render disabled.',
    },
    {
      name: 'isDateDisabled',
      type: '(date: Date) => boolean',
      default: '() => false',
      description: 'Additional per-date disable predicate, checked alongside min/max.',
    },
    {
      name: 'dateFormat',
      type: '(date: Date) => string',
      default: 'undefined',
      description: "Formats the trigger's displayed text. Defaults to a locale date (or date+time / time-only string, depending on showTime/timeOnly) if omitted.",
    },
    {
      name: 'showTodayButton',
      type: 'boolean',
      default: 'false',
      description: 'Shows a "Today" button in the panel footer that jumps to and selects the current date.',
    },
    {
      name: 'showTime',
      type: 'boolean',
      default: 'false',
      description: 'Adds hour/minute controls below the calendar; the picked day and time combine into one Date.',
    },
    {
      name: 'timeFormat',
      type: "'12h' | '24h'",
      default: "'24h'",
      description: 'Display format for the time controls (internal state is always 24h).',
    },
    {
      name: 'timeOnly',
      type: 'boolean',
      default: 'false',
      description: 'Hides the calendar entirely, showing just the time controls -- implies showTime.',
    },
    {
      name: 'manualInput',
      type: 'boolean',
      default: 'false',
      description: 'Lets the trigger be typed into directly instead of only opened by click; committed on blur/Enter via parseDate.',
    },
    {
      name: 'parseDate',
      type: '(text: string) => Date | null',
      default: 'new Date(text)',
      description: 'Parses manually-typed text into a Date, or null if unparseable.',
    },
    {
      name: 'selectionMode',
      type: "'single' | 'multiple' | 'range'",
      default: "'single'",
      description: "'single' binds through value (ngModel/formControl/Signal Forms). 'multiple'/'range' bind through the separate multipleValue/rangeValue models instead, and aren't routed through the ControlValueAccessor.",
    },
    {
      name: 'multipleValue',
      type: 'Date[]',
      default: '[]',
      description: 'Two-way bindable via [(multipleValue)]. Bound when selectionMode="multiple"; clicking a day toggles it in/out.',
    },
    {
      name: 'rangeValue',
      type: 'DateRange | null',
      default: 'null',
      description: 'Two-way bindable via [(rangeValue)]. Bound when selectionMode="range"; { start, end } with end null while a range is still in progress.',
    },
    {
      name: 'inlineYearsOnMobile',
      type: 'boolean',
      default: 'true',
      description: 'Below the ~640px mobile breakpoint, renders the year list inline in the main panel instead of as a floating side panel. No effect if inlineYears is already forcing inline everywhere.',
    },
    {
      name: 'inlineYears',
      type: 'boolean',
      default: 'false',
      description: 'Forces the year list inline in the main panel on every viewport, never as a floating side panel. Takes priority over inlineYearsOnMobile.',
    },
    {
      name: 'value',
      type: 'Date | null',
      default: 'null',
      description: 'The picked date for the default selectionMode="single". A two-way model -- bindable via ngModel/formControlName/formField, or directly with [(value)].',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the trigger and closes the panel if open. Inherited from BaseFormFieldControl; also settable through reactive forms/Signal Forms.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Marks the control invalid, driving aria-invalid and the error border. Also derived automatically from a touched/dirty invalid reactive-forms control.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the trigger once, after its first render. No effect in inline mode -- there is no trigger to focus.',
    },
    {
      name: 'disableAutocomplete',
      type: 'boolean',
      default: 'false',
      description: 'Sets autocomplete="off" on the trigger input, for manualInput fields the browser shouldn\'t offer to autofill.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted when the panel closes, so Signal Forms marks the field touched (single selectionMode only).',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-open', description: 'Present while the popover panel is open (absent when inline).' },
    { name: 'data-inline', description: 'Present when inline is set -- switches :host to display: inline-block.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-date-picker__trigger', description: 'The text input that opens the popover.' },
    { name: '.s-date-picker__panel', description: 'The popover panel wrapping the header, grid, and (optional) time/footer.' },
    { name: '.s-date-picker__inline-panel', description: "The panel's equivalent container when inline is set." },
    { name: '.s-date-picker__header', description: 'The prev/next navigation and month/year drill-down buttons.' },
    { name: '.s-date-picker__grid', description: 'The 7-column days grid.' },
    { name: '.s-date-picker__day', description: 'A single day cell button in the grid.' },
    { name: '.s-date-picker__unit', description: 'A single month or year cell button, in the months/years drill-down views.' },
    { name: '.s-date-picker__years-panel', description: 'The floating side panel listing selectable years.' },
    { name: '.s-date-picker__time', description: 'Wraps the hour/minute/period controls when showTime or timeOnly is set.' },
    { name: '.s-date-picker__footer', description: 'Wraps the "Today" button when showTodayButton is set.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-date-picker-day-size', description: 'Width/height of each day cell, and the basis for the panel min-width.' },
    { name: '--semiui-comp-date-picker-font-size', description: 'Font size across the header, grid, and time controls.' },
    { name: '--semiui-comp-date-picker-nav-background-hover', description: 'Hover background for the prev/next and month/year header buttons.' },
    { name: '--semiui-comp-date-picker-month-label-foreground', description: 'Text color of the month/year header buttons and time separator.' },
    { name: '--semiui-comp-date-picker-weekday-foreground', description: 'Text color of the weekday row above the grid.' },
    { name: '--semiui-comp-date-picker-day-foreground', description: 'Default day/month/year cell text color.' },
    { name: '--semiui-comp-date-picker-day-foreground-outside-month', description: 'Text color for days belonging to the previous/next month.' },
    { name: '--semiui-comp-date-picker-day-background-hover', description: 'Hover background for an enabled, unselected cell.' },
    { name: '--semiui-comp-date-picker-day-border-today', description: "Border color marking today's cell." },
    { name: '--semiui-comp-date-picker-day-background-selected', description: 'Background of a selected day/month/year cell (and the range-in-between tint, at reduced opacity).' },
    { name: '--semiui-comp-date-picker-day-foreground-selected', description: 'Text color of a selected cell.' },
    {
      name: '--semiui-comp-select-*',
      description: 'The trigger input and popover panel chrome (border, background, radius, focus ring, disabled state) intentionally reuse the Select component\'s tokens, for a consistent look across form controls.',
    },
  ];
}

import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { DatePickerComponent, DateRange } from '../../../../components/date-picker/date-picker.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

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
}

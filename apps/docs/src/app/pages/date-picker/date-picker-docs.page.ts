import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { DatePickerComponent } from '../../date-picker/date-picker.component';

@Component({
  selector: 'app-date-picker-docs-page',
  imports: [DatePickerComponent, FormsModule, ReactiveFormsModule, FormField, DatePipe],
  templateUrl: './date-picker-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class DatePickerDocsPage {
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

  // weekends disabled
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

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { SelectComponent } from '../../select/select.component';

interface Country {
  code: string;
  name: string;
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'EG', name: 'Egypt' },
  { code: 'JP', name: 'Japan' },
];

@Component({
  selector: 'app-select-docs-page',
  imports: [SelectComponent, FormsModule, ReactiveFormsModule, FormField, JsonPipe],
  templateUrl: './select-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class SelectDocsPage {
  protected fruits = ['Apple', 'Banana', 'Cherry', 'Date'];
  protected countries = COUNTRIES;

  // ngModel, primitive options
  protected fruit = '';

  // ngModel, option objects
  protected country: Country | undefined;

  // Reactive forms
  protected reactiveForm = new FormGroup({
    country: new FormControl<Country | undefined>(undefined, Validators.required),
  });

  // Signal Forms
  protected profileModel = signal({ country: COUNTRIES[0] });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

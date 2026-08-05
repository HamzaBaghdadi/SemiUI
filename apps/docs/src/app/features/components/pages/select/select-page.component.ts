import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { SelectComponent } from '../../../../components/select/select.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

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
  selector: 'app-select-page',
  imports: [
    SelectComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    JsonPipe,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './select-page.component.html',
  styleUrl: './select-page.component.css',
})
export class SelectPageComponent {
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
  protected loading = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }

  protected readonly primitiveCode = `<s-select [options]="['Apple', 'Banana', 'Cherry']" [(ngModel)]="fruit" placeholder="Pick a fruit" />`;

  protected readonly objectsCode = `<s-select [options]="countries" optionLabel="name" [(ngModel)]="selectedCountry" placeholder="Select a country" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  country: new FormControl<Country | undefined>(undefined, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-select [options]="countries" optionLabel="name" formControlName="country" errorMessage="Please select a country." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ country: countries[0] });
protected profileForm = form(this.profileModel);

<s-select [options]="countries" optionLabel="name" [formField]="profileForm.country" />`;

  protected readonly customTemplatesCode = `<s-select [options]="countries" [(ngModel)]="selectedCountry">
  <ng-template #selected let-option>
    {{ option.code }} &mdash; {{ option.name }}
  </ng-template>
  <ng-template #option let-option let-selected="selected">
    {{ selected ? '✓' : '' }} {{ option.name }}
  </ng-template>
  <ng-template #header><strong>Available Countries</strong></ng-template>
</s-select>`;

  protected readonly clearSearchCode = `<s-select [options]="countries" optionLabel="name" [(ngModel)]="selectedCountry"
  [clearable]="false" [filterable]="false" />`;

  protected readonly loadingCode = `<s-select [loading]="true" />`;

  protected readonly appendToCode = `<s-select [options]="fruits" appendTo="body" />`;
}

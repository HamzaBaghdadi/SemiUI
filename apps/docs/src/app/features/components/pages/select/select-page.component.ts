import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { SelectComponent } from '../../../../components/select/select.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

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
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
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

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'options',
      type: 'readonly TOption[]',
      default: '[]',
      description: 'Plain values, or objects paired with optionLabel / optionValue.',
    },
    {
      name: 'optionLabel',
      type: 'string',
      default: 'undefined',
      description: 'Property to read the display label from, when options are objects. Omit for primitive options.',
    },
    {
      name: 'optionValue',
      type: 'string',
      default: 'undefined',
      description: 'Property to read the bound value from, when options are objects. Omit to use the whole option as the value.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Text shown in the trigger when nothing is selected.',
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'true',
      description: 'Shows a clear ("x") affordance when a value is selected. Keyboard users can also press Backspace/Delete on the closed trigger.',
    },
    {
      name: 'filterable',
      type: 'boolean',
      default: 'true',
      description: 'Shows a search box in the panel that filters options by label as you type.',
    },
    {
      name: 'filterPlaceholder',
      type: 'string',
      default: "'Search...'",
      description: 'Placeholder for the filter search box.',
    },
    {
      name: 'emptyMessage',
      type: 'string',
      default: "'No results found'",
      description: 'Shown in the list when filtering produces no matches.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows a spinner in place of the chevron and disables interaction, for async option loading.',
    },
    {
      name: 'appendTo',
      type: "'body' | null",
      default: 'null',
      description: "Moves the panel to a direct child of document.body, escaping any ancestor's overflow: hidden clipping or transform/filter stacking context.",
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the control while invalid.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the trigger.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Forces the invalid visual state and error message, independent of form-control validity.',
    },
    {
      name: '#selected',
      type: 'ng-template, context: { $implicit: TOption | undefined }',
      default: 'undefined',
      description: "Content-projected template slot. Custom rendering for the selected value shown in the closed trigger.",
    },
    {
      name: '#option',
      type: 'ng-template, context: { $implicit: TOption; index: number; selected: boolean }',
      default: 'undefined',
      description: 'Content-projected template slot. Custom rendering for each row in the open option list.',
    },
    {
      name: '#icon',
      type: 'ng-template',
      default: 'undefined',
      description: 'Content-projected template slot. Replaces the default chevron icon in the trigger.',
    },
    {
      name: '#header',
      type: 'ng-template',
      default: 'undefined',
      description: 'Content-projected template slot. Rendered above the option list.',
    },
    {
      name: '#footer',
      type: 'ng-template',
      default: 'undefined',
      description: 'Content-projected template slot. Rendered below the option list.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the trigger once, after its first render.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on close (blur-equivalent), so Signal Forms / reactive forms mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-open', description: 'Present on the host while the panel is open -- rotates the chevron icon.' },
    { name: 'data-placement', description: "On the panel: 'top' or 'bottom' -- which side of the trigger it opened on." },
    { name: 'data-appended', description: "On the panel: present when appendTo=\"body\" -- switches it to fixed, pixel-positioned layout." },
    { name: 'data-active', description: 'On an option: present on the keyboard-highlighted row.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-select__trigger', description: 'The closed button carrying background, border, and typography.' },
    { name: '.s-select__trigger--loading', description: 'Applied while loading -- dims the trigger via opacity instead of the flat disabled palette.' },
    { name: '.s-select__value', description: "The trigger's label/placeholder content." },
    { name: '.s-select__placeholder', description: 'Wraps the placeholder text when nothing is selected.' },
    { name: '.s-select__icon', description: 'Wraps the trailing chevron (or loading spinner, or #icon template).' },
    { name: '.s-select__icon--spin', description: 'Added to the icon while loading, to animate its rotation.' },
    { name: '.s-select__clear', description: 'The clear ("x") affordance shown when clearable and a value is selected.' },
    { name: '.s-select__panel', description: 'The dropdown panel.' },
    { name: '.s-select__panel--enter / --leave', description: 'Applied briefly while the panel enters/leaves (scale + fade).' },
    { name: '.s-select__header / __footer', description: '#header / #footer template wrappers.' },
    { name: '.s-select__filter', description: 'Wraps the filter search box.' },
    { name: '.s-select__filter-input', description: 'The filter text input.' },
    { name: '.s-select__list', description: 'The scrollable option list.' },
    { name: '.s-select__option', description: 'Each option row.' },
    { name: '.s-select__empty', description: 'Shown in place of the list when filtering produces no matches.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-select-radius', description: 'Corner radius, shared by trigger and panel.' },
    { name: '--semiui-comp-select-font-size', description: 'Text size for trigger and options.' },
    { name: '--semiui-comp-select-padding-{x,y}', description: 'Trigger padding.' },
    { name: '--semiui-comp-select-background', description: 'Trigger background.' },
    { name: '--semiui-comp-select-foreground', description: 'Trigger text color.' },
    { name: '--semiui-comp-select-border', description: 'Default trigger border color.' },
    { name: '--semiui-comp-select-border-hover', description: 'Trigger border color on hover, while enabled and valid.' },
    { name: '--semiui-comp-select-border-focus', description: 'Trigger border color while focused.' },
    { name: '--semiui-comp-select-focus-ring', description: 'Color of the focus-visible ring (rendered at 35% opacity).' },
    { name: '--semiui-comp-select-border-invalid', description: 'Trigger border color while invalid.' },
    { name: '--semiui-comp-select-background-disabled', description: 'Trigger background while disabled (not loading).' },
    { name: '--semiui-comp-select-foreground-disabled', description: 'Trigger text color while disabled (not loading).' },
    { name: '--semiui-comp-select-placeholder-foreground', description: 'Placeholder text and icon color.' },
    { name: '--semiui-comp-select-panel-background', description: 'Panel background.' },
    { name: '--semiui-comp-select-panel-border', description: 'Panel border color, also used by the filter box divider.' },
    { name: '--semiui-comp-select-panel-shadow', description: 'Panel drop shadow.' },
    { name: '--semiui-comp-select-option-foreground', description: 'Option text color.' },
    { name: '--semiui-comp-select-option-foreground-selected', description: 'Selected option text color.' },
    { name: '--semiui-comp-select-option-background-hover', description: 'Background for the active/hovered option, and the clear button on hover.' },
    { name: '--semiui-comp-select-option-background-selected', description: 'Background for the selected option.' },
  ];
}

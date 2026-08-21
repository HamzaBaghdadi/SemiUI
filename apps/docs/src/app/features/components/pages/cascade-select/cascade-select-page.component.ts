import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CascadeSelectComponent } from '../../../../components/cascade-select/cascade-select.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface Place {
  label: string;
  children?: Place[];
}

const PLACES: Place[] = [
  {
    label: 'United States',
    children: [
      { label: 'California', children: [{ label: 'Los Angeles' }, { label: 'San Francisco' }, { label: 'San Diego' }] },
      { label: 'Texas', children: [{ label: 'Houston' }, { label: 'Austin' }, { label: 'Dallas' }] },
      { label: 'New York', children: [{ label: 'New York City' }, { label: 'Buffalo' }] },
    ],
  },
  {
    label: 'Canada',
    children: [
      { label: 'Ontario', children: [{ label: 'Toronto' }, { label: 'Ottawa' }] },
      { label: 'Quebec', children: [{ label: 'Montreal' }, { label: 'Quebec City' }] },
    ],
  },
  {
    label: 'Germany',
    children: [
      { label: 'Bavaria', children: [{ label: 'Munich' }, { label: 'Nuremberg' }] },
      { label: 'Berlin', children: [{ label: 'Berlin' }] },
    ],
  },
];

@Component({
  selector: 'app-cascade-select-page',
  imports: [
    CascadeSelectComponent,
    ButtonComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './cascade-select-page.component.html',
  styleUrl: './cascade-select-page.component.css',
})
export class CascadeSelectPageComponent {
  protected readonly places = PLACES;

  // ngModel
  protected city?: string;

  // Reactive forms
  protected reactiveForm = new FormGroup({
    destination: new FormControl<string | undefined>(undefined, { validators: Validators.required }),
  });

  // Signal Forms
  protected profileModel = signal({ hometown: 'Toronto' });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);
  protected loading = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }

  protected readonly ngModelCode = `protected places = [
  { label: 'United States', children: [
    { label: 'California', children: [{ label: 'Los Angeles' }, { label: 'San Francisco' }] },
    { label: 'Texas', children: [{ label: 'Houston' }, { label: 'Austin' }] },
  ] },
  { label: 'Canada', children: [
    { label: 'Ontario', children: [{ label: 'Toronto' }, { label: 'Ottawa' }] },
  ] },
];

<s-cascade-select [options]="places" optionLabel="label" optionValue="label" [(ngModel)]="city" placeholder="Pick a city" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  destination: new FormControl<string | undefined>(undefined, { validators: Validators.required }),
});

<div [formGroup]="reactiveForm">
  <s-cascade-select
    [options]="places" optionLabel="label" optionValue="label"
    formControlName="destination" placeholder="Pick a destination"
    errorMessage="Pick a destination to continue."
  />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ hometown: 'Toronto' });
protected profileForm = form(this.profileModel);

<s-cascade-select [options]="places" optionLabel="label" optionValue="label" [formField]="profileForm.hometown" placeholder="Pick a hometown" />`;

  protected readonly appendToCode = `<s-cascade-select [options]="places" optionLabel="label" optionValue="label" appendTo="body" placeholder="Pick a city" class="w-56" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'unknown',
      default: 'undefined',
      description: "The selected leaf's resolved value. Two-way bindable via [(value)], ngModel, reactive forms, or [formField].",
    },
    {
      name: 'options',
      type: 'readonly TOption[]',
      default: '[]',
      description: 'The root-level nodes. Each node may have children (see optionChildren) to nest further levels.',
    },
    {
      name: 'optionLabel',
      type: 'string',
      default: 'undefined',
      description: 'Property to read each node\'s display label from. Omit for primitive (string) options.',
    },
    {
      name: 'optionValue',
      type: 'string',
      default: 'undefined',
      description: 'Property to read the bound value from a selected leaf. Omit to use the whole leaf object as the value.',
    },
    {
      name: 'optionChildren',
      type: 'string',
      default: "'children'",
      description: "Property to read each node's child options from.",
    },
    {
      name: 'separator',
      type: 'string',
      default: "' / '",
      description: "Joins each level's label into the trigger's display text once a leaf is selected.",
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Text shown in the trigger while nothing is selected.',
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'true',
      description: 'Shows a clear ("x") affordance when a value is selected. Backspace/Delete on the trigger also clears.',
    },
    {
      name: 'emptyMessage',
      type: 'string',
      default: "'No results found'",
      description: 'Shown in a column that has no options.',
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
      description: "Moves the panel to a direct child of document.body, escaping any ancestor's overflow: hidden clipping.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables opening the panel.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Marks the field invalid; also derived automatically from a touched/dirty reactive-forms control.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the trigger while the field is invalid.',
    },
    {
      name: '#selected template context',
      type: '{ $implicit: TOption[] }',
      description: 'Custom rendering for the closed trigger. Context is the selected root-to-leaf path array (empty when nothing is selected).',
    },
    {
      name: '#option template context',
      type: '{ $implicit: TOption; index: number; level: number; hasChildren: boolean; selected: boolean }',
      description: 'Custom rendering for each row across every column.',
    },
    {
      name: '#icon template context',
      type: '{}',
      description: 'Replaces the default trigger chevron.',
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
      description: 'Emitted on blur, so Signal Forms / reactive forms can mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-open', description: 'Present on the host while the panel is open.' },
    { name: 'data-active', description: "Present on the highlighted option within its column, e.g. for keyboard navigation." },
    { name: 'data-has-children', description: 'Present on an option that opens a further column instead of being directly selectable.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-cascade-select__trigger', description: 'The closed-state button carrying background/border and the selected path text.' },
    { name: '.s-cascade-select__panel', description: 'The floating multi-column container.' },
    { name: '.s-cascade-select__column', description: 'One level\'s scrollable option list.' },
    { name: '.s-cascade-select__option', description: 'A single row within a column.' },
    { name: '.s-cascade-select__caret', description: "Points into the next column on a row that has children." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-select-*', description: "Reuses Select's own trigger/panel/option tokens rather than owning a comp.cascadeSelect block -- padding, radius, font-size, background/foreground/border (rest, hover, focus, invalid, disabled), panel background/border/shadow, and option hover/selected colors." },
  ];
}

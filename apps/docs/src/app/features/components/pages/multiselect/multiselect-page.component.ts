import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { MultiselectComponent } from '../../../../components/multiselect/multiselect.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface Skill {
  code: string;
  name: string;
}

const SKILLS: Skill[] = [
  { code: 'ts', name: 'TypeScript' },
  { code: 'ng', name: 'Angular' },
  { code: 'rx', name: 'RxJS' },
  { code: 'css', name: 'CSS' },
  { code: 'node', name: 'Node.js' },
];

@Component({
  selector: 'app-multiselect-page',
  imports: [
    MultiselectComponent,
    ButtonComponent,
    RouterLink,
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
  templateUrl: './multiselect-page.component.html',
  styleUrl: './multiselect-page.component.css',
})
export class MultiselectPageComponent {
  protected fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
  protected skills = SKILLS;

  // ngModel, primitive options
  protected selectedFruits: string[] = ['Banana'];

  // ngModel, option objects
  protected selectedSkillCodes: string[] = [];

  // Reactive forms
  protected reactiveForm = new FormGroup({
    skills: new FormControl<string[]>([], { nonNullable: true, validators: Validators.required }),
  });

  // Signal Forms
  protected profileModel = signal({ skills: ['ts', 'ng'] });
  protected profileForm = form(this.profileModel);

  // Custom templates
  protected templatedSkillCodes: string[] = ['ts', 'ng'];

  // removableChips
  protected pinnedFruits: string[] = ['Apple', 'Cherry'];

  protected disabled = signal(false);
  protected loading = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }

  protected readonly primitiveCode = `<s-multiselect [options]="['Apple', 'Banana', 'Cherry']" [(ngModel)]="selectedFruits" placeholder="Pick fruits" />`;

  protected readonly objectsCode = `<s-multiselect [options]="skills" optionLabel="name" optionValue="code" [(ngModel)]="selectedSkillCodes" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  skills: new FormControl<string[]>([], { nonNullable: true, validators: Validators.required }),
});

<div [formGroup]="reactiveForm">
  <s-multiselect [options]="skills" optionLabel="name" optionValue="code" formControlName="skills" errorMessage="Pick at least one skill." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ skills: ['ts', 'ng'] });
protected profileForm = form(this.profileModel);

<s-multiselect [options]="skills" optionLabel="name" optionValue="code" [formField]="profileForm.skills" />`;

  protected readonly customTemplatesCode = `<s-multiselect [options]="skills" optionLabel="name" optionValue="code" [(ngModel)]="selectedSkillCodes">
  <ng-template #selected let-options>
    <!-- options is the full array of selected values -->
  </ng-template>
  <ng-template #option let-option let-selected="selected">
    {{ selected ? '✓' : '' }} {{ option.name }}
  </ng-template>
  <ng-template #header><strong>Available Skills</strong></ng-template>
</s-multiselect>`;

  protected readonly removableChipsCode = `<s-multiselect [options]="fruits" [removableChips]="false" />`;

  protected readonly closeOnSelectCode = `<s-multiselect [closeOnSelect]="true" [maxChipsDisplay]="2" />`;

  protected readonly loadingCode = `<s-multiselect [loading]="true" />`;

  protected readonly appendToCode = `<s-multiselect [options]="fruits" appendTo="body" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'options',
      type: 'readonly TOption[]',
      default: '[]',
      description: 'The list of selectable options -- primitives or objects, same shape as Select.',
    },
    {
      name: 'optionLabel',
      type: 'string',
      default: 'undefined',
      description: 'Property key to read the display label from, for option objects. Omit for primitive options.',
    },
    {
      name: 'optionValue',
      type: 'string',
      default: 'undefined',
      description: 'Property key to read the bound value from, for option objects. Omit to use the option itself.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Text shown in the trigger when nothing is selected.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Text shown via s-error-message when the control is invalid.',
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'true',
      description: 'Shows a clear-all ("x") affordance in the trigger once something is selected.',
    },
    {
      name: 'filterable',
      type: 'boolean',
      default: 'true',
      description: 'Shows a search input in the panel that filters the visible options.',
    },
    {
      name: 'filterPlaceholder',
      type: 'string',
      default: "'Search...'",
      description: 'Placeholder for the filter input.',
    },
    {
      name: 'emptyMessage',
      type: 'string',
      default: "'No results found'",
      description: 'Text shown in the list when filtering matches nothing.',
    },
    {
      name: 'closeOnSelect',
      type: 'boolean',
      default: 'false',
      description: 'Closes the panel after each selection, instead of staying open for picking more.',
    },
    {
      name: 'showSelectAll',
      type: 'boolean',
      default: 'true',
      description: 'Shows a master checkbox in the filter row that selects/clears every currently-filtered option.',
    },
    {
      name: 'maxChipsDisplay',
      type: 'number',
      default: '3',
      description: 'Once more than this many items are selected, the trigger shows "N selected" instead of individual chips.',
    },
    {
      name: 'removableChips',
      type: 'boolean',
      default: 'true',
      description: 'Shows a remove ("x") button on each chip, via <s-tag removable>. Set to false for read-only chips.',
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
      description: "Moves the panel to a direct child of document.body, escaping any ancestor's overflow/transform clipping.",
    },
    {
      name: 'value',
      type: 'unknown[]',
      default: '[]',
      description: 'The selected values. Bindable via ngModel, reactive forms, Signal Forms, or plain [(value)].',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the trigger and panel interaction.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Marks the control invalid, in addition to any reactive-forms/Signal-Forms invalid state detected automatically.',
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
      description: 'Emitted when the panel closes, so Signal Forms marks the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-open', description: "Present on the host while the panel is open -- e.g. [data-open] rotates the trigger's chevron icon." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-multiselect__trigger', description: 'The clickable control showing the placeholder, chips, or summary.' },
    { name: '.s-multiselect__trigger--loading', description: 'Applied while loading -- dims the trigger via opacity instead of the flat disabled palette.' },
    { name: '.s-multiselect__panel', description: 'The dropdown listbox panel.' },
    { name: '.s-multiselect__option[data-active]', description: 'The keyboard-active option row.' },
    { name: '.s-multiselect__checkbox[data-checked]', description: "Each row's checkbox indicator when selected." },
    { name: '.s-multiselect__select-all-box[data-checked]', description: 'The master "select all" checkbox indicator when all filtered options are selected.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-select-background / -foreground / -border', description: 'Trigger colors. Shared with Select.' },
    { name: '--semiui-comp-select-border-hover / -border-focus / -focus-ring', description: 'Trigger hover/focus colors. Shared with Select.' },
    { name: '--semiui-comp-select-border-invalid', description: 'Trigger border color when invalid. Shared with Select.' },
    { name: '--semiui-comp-select-background-disabled / -foreground-disabled', description: 'Trigger colors when disabled. Shared with Select.' },
    { name: '--semiui-comp-select-placeholder-foreground', description: 'Placeholder, icon, and filter-icon color. Shared with Select.' },
    { name: '--semiui-comp-select-panel-background / -panel-border / -panel-shadow', description: 'Dropdown panel colors. Shared with Select.' },
    { name: '--semiui-comp-select-option-background-hover / -option-foreground', description: 'Option row colors. Shared with Select.' },
    { name: '--semiui-comp-select-radius / -padding-x / -padding-y / -font-size', description: 'Trigger sizing. Shared with Select.' },
    { name: '--semiui-comp-checkbox-background / -border / -background-checked / -border-checked', description: 'Row and "select all" checkbox colors. Shared with Checkbox.' },
    { name: '--semiui-comp-checkbox-focus-ring', description: 'Focus ring color for the "select all" checkbox. Shared with Checkbox.' },
    { name: '--semiui-comp-tag-font-size / -padding-y', description: "Read to size the trigger's chip row precisely. Shared with Tag." },
  ];
}

import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { RadioGroupComponent } from '../../../../components/radio-group/radio-group.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface Plan {
  id: string;
  name: string;
  disabled?: boolean;
}

const PLANS: Plan[] = [
  { id: 'free', name: 'Free' },
  { id: 'pro', name: 'Pro' },
  { id: 'enterprise', name: 'Enterprise', disabled: true },
];

@Component({
  selector: 'app-radio-group-page',
  imports: [
    RadioGroupComponent,
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
  templateUrl: './radio-group-page.component.html',
  styleUrl: './radio-group-page.component.css',
})
export class RadioGroupPageComponent {
  protected fruits = ['Apple', 'Banana', 'Cherry'];
  protected plans = PLANS;

  // ngModel, primitive options
  protected fruit = 'Apple';

  // ngModel, option objects
  protected plan: string | undefined = 'pro';

  // Reactive forms
  protected reactiveForm = new FormGroup({
    plan: new FormControl<string | undefined>(undefined, Validators.required),
  });

  // Signal Forms
  protected profileModel = signal({ plan: 'free' });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly primitiveCode = `<s-radio-group [options]="['Apple', 'Banana', 'Cherry']" [(ngModel)]="fruit" />`;

  protected readonly objectsCode = `<s-radio-group [options]="plans" optionLabel="name" optionValue="id" optionDisabled="disabled" [(ngModel)]="selectedPlan" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  plan: new FormControl<string | undefined>(undefined, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-radio-group [options]="plans" optionLabel="name" optionValue="id" formControlName="plan" errorMessage="Please choose a plan." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ plan: 'free' });
protected profileForm = form(this.profileModel);

<s-radio-group [options]="plans" optionLabel="name" optionValue="id" [formField]="profileForm.plan" />`;

  protected readonly horizontalCode = `<s-radio-group direction="horizontal" />  <!-- default is "vertical" -->`;

  protected readonly sizesCode = `<s-radio-group size="sm" />  <!-- also "md" (default) and "lg" -->`;

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
      name: 'optionDisabled',
      type: 'string',
      default: 'undefined',
      description: 'Property to read a per-option disabled flag from, when options are objects.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Controls the size of each radio dot.',
    },
    {
      name: 'direction',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      description: 'Layout direction of the option list.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the group while invalid.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables every radio input in the group.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Forces the invalid visual state and error message, independent of form-control validity.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the checked radio once, after the first render -- or the first radio if none is checked.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur, so Signal Forms / reactive forms mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-direction', description: "The active direction, e.g. [data-direction='horizontal'] -- switches the group to a row layout." },
    { name: 'data-size', description: "The active size, e.g. [data-size='md'] -- drives each radio dot's diameter." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-radio-group', description: 'The group wrapper, laid out as a column (or row, under data-direction) of options.' },
    { name: '.s-radio', description: 'Each option label, wrapping the (visually hidden) native input, the dot, and the text label.' },
    { name: '.s-radio__input', description: 'The visually-hidden native radio input driving checked/focus state.' },
    { name: '.s-radio__dot', description: "The visible circle -- its ::after inner dot scales in when the sibling input is :checked." },
    { name: '.s-radio__label', description: "Each option's text label." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-radio-size-{sm,md,lg}', description: 'Dot diameter per size.' },
    { name: '--semiui-comp-radio-border', description: 'Dot border color, unchecked.' },
    { name: '--semiui-comp-radio-border-checked', description: 'Dot border color, checked.' },
    { name: '--semiui-comp-radio-background', description: 'Dot background.' },
    { name: '--semiui-comp-radio-dot-background', description: "The inner filled dot's color, shown once checked." },
    { name: '--semiui-comp-radio-focus-ring', description: 'Color of the focus-visible ring (rendered at 35% opacity).' },
    { name: '--semiui-comp-radio-background-disabled', description: 'Dot background while disabled.' },
    { name: '--semiui-comp-radio-border-disabled', description: 'Dot border color while disabled.' },
  ];
}

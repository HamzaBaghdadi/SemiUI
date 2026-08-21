import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CheckboxComponent } from '../../../../components/checkbox/checkbox.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-checkbox-page',
  imports: [
    ButtonComponent,
    CheckboxComponent,
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
  templateUrl: './checkbox-page.component.html',
  styleUrl: './checkbox-page.component.css',
})
export class CheckboxPageComponent {
  // ngModel
  protected subscribed = true;

  // Reactive forms
  protected reactiveForm = new FormGroup({
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  // Signal Forms
  protected profileModel = signal({ marketing: false });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);
  protected indeterminate = signal(true);

  protected readonly ngModelCode = `<s-checkbox [(ngModel)]="subscribed" label="Subscribe to updates" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
});

<div [formGroup]="reactiveForm">
  <s-checkbox formControlName="terms" label="I agree to the terms" errorMessage="You must agree to continue." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ marketing: false });
protected profileForm = form(this.profileModel);

<s-checkbox [formField]="profileForm.marketing" label="Marketing emails" />`;

  protected readonly sizesCode = `<s-checkbox size="sm" />  <!-- also "md" (default) and "lg" -->`;

  protected readonly indeterminateCode = `<s-checkbox [indeterminate]="true" label="Select all" />`;

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Text label rendered next to the box; associates via the wrapping <label>.',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: 'undefined',
      description: 'Accessible name for icon/label-less checkboxes (e.g. a bare selection checkbox in a table cell). Forwarded to the native input; unnecessary when label is set.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the checkbox while invalid.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Controls the box dimensions via the size-scoped tokens.',
    },
    {
      name: 'indeterminate',
      type: 'boolean',
      default: 'false',
      description: "Visually shows a dash instead of a checkmark, regardless of value. Purely presentational -- doesn't change the bound value.",
    },
    {
      name: 'value',
      type: 'boolean',
      default: 'false',
      description: 'The checked state. A two-way model -- bindable via ngModel/formControlName/formField, or directly with [(value)] for standalone use.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the control. Inherited from BaseFormFieldControl; also settable through reactive forms/Signal Forms.',
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
      description: 'Focuses the checkbox once, after its first render.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur, so Signal Forms marks the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-checkbox', description: 'The label wrapping the native input, box, and text label.' },
    { name: '.s-checkbox__input', description: 'The visually-hidden native checkbox input carrying the real interaction and a11y semantics.' },
    { name: '.s-checkbox__box', description: 'The visible styled box (border, background, check/indeterminate icon).' },
    { name: '.s-checkbox__label', description: 'The text label, when label is set.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-checkbox-size-{sm,md,lg}', description: 'Box width/height per size.' },
    { name: '--semiui-comp-checkbox-radius', description: 'Box corner radius.' },
    { name: '--semiui-comp-checkbox-border', description: 'Box border color when unchecked.' },
    { name: '--semiui-comp-checkbox-background', description: 'Box background when unchecked.' },
    { name: '--semiui-comp-checkbox-background-checked', description: 'Box background when checked or indeterminate.' },
    { name: '--semiui-comp-checkbox-border-checked', description: 'Box border color when checked or indeterminate.' },
    { name: '--semiui-comp-checkbox-foreground-checked', description: 'Color of the check/indeterminate icon.' },
    { name: '--semiui-comp-checkbox-focus-ring', description: 'Color of the focus-visible ring (rendered at 35% opacity).' },
    { name: '--semiui-comp-checkbox-background-disabled', description: 'Box background when disabled.' },
    { name: '--semiui-comp-checkbox-border-disabled', description: 'Box border color when disabled.' },
  ];
}

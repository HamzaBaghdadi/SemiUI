import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { OtpComponent } from '../../../../components/otp/otp.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-otp-page',
  imports: [
    OtpComponent,
    ButtonComponent,
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
  templateUrl: './otp-page.component.html',
  styleUrl: './otp-page.component.css',
})
export class OtpPageComponent {
  // ngModel
  protected code = '';
  protected disabled = signal(false);

  // Reactive forms
  // s-otp only ever writes back "" or a genuinely complete code (never a partial one), so
  // Validators.required alone is enough to mean "the code is complete".
  protected reactiveForm = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  // Signal Forms
  protected profileModel = signal({ code: '' });
  protected profileForm = form(this.profileModel);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-otp [(ngModel)]="code" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
});

<div [formGroup]="reactiveForm">
  <s-otp formControlName="code" errorMessage="Enter the full 6-digit code." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ code: '' });
protected profileForm = form(this.profileModel);

<s-otp [formField]="profileForm.code" />`;

  protected readonly variantsCode = `<s-otp [length]="4" />
<s-otp [length]="6" type="alphanumeric" />  <!-- also accepts letters, default is "numeric" -->
<s-otp [mask]="true" />  <!-- dots instead of the typed character -->`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'length',
      type: 'number',
      default: '6',
      description: 'Number of digit boxes.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Text shown via s-error-message when the control is invalid.',
    },
    {
      name: 'type',
      type: "'numeric' | 'alphanumeric'",
      default: "'numeric'",
      description: 'Restricts input to digits (default) or allows letters and digits.',
    },
    {
      name: 'mask',
      type: 'boolean',
      default: 'false',
      description: 'Renders each box as a password field (dots instead of the typed character).',
    },
    {
      name: 'value',
      type: 'string',
      default: "''",
      description: 'The concatenated code, but only once every box is filled -- never a partial string. Bindable via ngModel, reactive forms, Signal Forms, or plain [(value)].',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables every box.',
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
      description: 'Focuses the first box once, after the first render.',
    },
    {
      name: 'disableAutocomplete',
      type: 'boolean',
      default: 'false',
      description: 'Sets autocomplete="off" on every box, in place of the default autocomplete="one-time-code".',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur of any box, so Signal Forms marks the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-otp', description: 'The row wrapping all digit boxes.' },
    { name: '.s-otp__box', description: 'Each individual digit input.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-input-radius', description: 'Box corner radius. Shared with Text Input.' },
    { name: '--semiui-comp-input-border', description: 'Box border color. Shared with Text Input.' },
    { name: '--semiui-comp-input-background', description: 'Box background. Shared with Text Input.' },
    { name: '--semiui-comp-input-foreground', description: 'Box text color. Shared with Text Input.' },
    { name: '--semiui-comp-input-border-hover', description: 'Box border color on hover. Shared with Text Input.' },
    { name: '--semiui-comp-input-border-focus', description: 'Box border color when focused. Shared with Text Input.' },
    { name: '--semiui-comp-input-focus-ring', description: 'Color of the focus box-shadow ring. Shared with Text Input.' },
    { name: '--semiui-comp-input-border-invalid', description: 'Box border color when invalid. Shared with Text Input.' },
    { name: '--semiui-comp-input-background-disabled', description: 'Box background when disabled. Shared with Text Input.' },
    { name: '--semiui-comp-input-foreground-disabled', description: 'Box text color when disabled. Shared with Text Input.' },
  ];
}

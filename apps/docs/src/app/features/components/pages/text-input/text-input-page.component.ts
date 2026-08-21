import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TextInputComponent } from '../../../../components/text-input/text-input.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-text-input-page',
  imports: [
    ButtonComponent,
    TextInputComponent,
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
  templateUrl: './text-input-page.component.html',
  styleUrl: './text-input-page.component.css',
})
export class TextInputPageComponent {
  // ngModel
  protected name = 'Ada Lovelace';
  protected nameDisabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  // Signal Forms
  protected profileModel = signal({ username: '' });
  protected profileForm = form(this.profileModel);

  protected readonly ngModelCode = `<s-text-input [(ngModel)]="name" [disabled]="nameDisabled()" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
});

<div [formGroup]="reactiveForm">
  <s-text-input formControlName="email" errorMessage="Enter a valid email address" />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ username: '' });
protected profileForm = form(this.profileModel);

<s-text-input [formField]="profileForm.username" />`;

  protected readonly autoFocusCode = `<s-text-input [autoFocus]="true" [disableAutocomplete]="true" />`;

  toggleNameDisabled(): void {
    this.nameDisabled.update((value) => !value);
  }

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'string',
      default: "''",
      description: 'The current value. Two-way bindable via ngModel, formControlName, [formField], or [(value)].',
    },
    {
      name: 'type',
      type: "'text' | 'email' | 'tel' | 'url' | 'number' | 'search'",
      default: "'text'",
      description: 'Native input type attribute.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Placeholder text shown when the value is empty.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message rendered via <s-error-message> below the input while invalid.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the input. Also set automatically when the bound reactive-forms control is disabled.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Marks the field invalid. Also computed automatically from a bound reactive-forms/Signal Forms control once touched or dirty.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the field once, after its first render.',
    },
    {
      name: 'disableAutocomplete',
      type: 'boolean',
      default: 'false',
      description: 'Sets autocomplete="off" on the native input, for fields the browser shouldn\'t offer to autofill.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur -- lets Signal Forms mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-text-input', description: 'The native <input> element carrying background, border, and typography.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-input-padding-y', description: 'Vertical padding.' },
    { name: '--semiui-comp-input-padding-x', description: 'Horizontal padding.' },
    { name: '--semiui-comp-input-radius', description: 'Corner radius.' },
    { name: '--semiui-comp-input-font-size', description: 'Font size.' },
    { name: '--semiui-comp-input-background', description: 'Background color.' },
    { name: '--semiui-comp-input-foreground', description: 'Text color.' },
    { name: '--semiui-comp-input-border', description: 'Border color in the resting state.' },
    { name: '--semiui-comp-input-placeholder-foreground', description: 'Placeholder text color.' },
    { name: '--semiui-comp-input-border-hover', description: 'Border color on hover (when enabled and valid).' },
    { name: '--semiui-comp-input-border-focus', description: 'Border color while focused.' },
    { name: '--semiui-comp-input-focus-ring', description: 'Color of the focus-visible ring (rendered at 35% opacity).' },
    { name: '--semiui-comp-input-border-invalid', description: "Border color when [aria-invalid='true']." },
    { name: '--semiui-comp-input-background-disabled', description: 'Background when disabled.' },
    { name: '--semiui-comp-input-foreground-disabled', description: 'Text color when disabled.' },
  ];
}

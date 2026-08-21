import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TextareaComponent } from '../../../../components/textarea/textarea.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-textarea-page',
  imports: [
    TextareaComponent,
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
  templateUrl: './textarea-page.component.html',
  styleUrl: './textarea-page.component.css',
})
export class TextareaPageComponent {
  // ngModel
  protected bio = 'Building SemiUI, an Angular UI library.';
  protected disabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    feedback: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(280)] }),
  });

  // Signal Forms
  protected profileModel = signal({ notes: '' });
  protected profileForm = form(this.profileModel);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-textarea [(ngModel)]="bio" placeholder="Tell us about yourself" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  feedback: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(280)] }),
});

<div [formGroup]="reactiveForm">
  <s-textarea formControlName="feedback" [maxLength]="280" errorMessage="Feedback is required (max 280 characters)." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ notes: '' });
protected profileForm = form(this.profileModel);

<s-textarea [formField]="profileForm.notes" />`;

  protected readonly autoResizeCode = `<s-textarea [autoResize]="true" [rows]="2" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'string',
      default: "''",
      description: 'The current value. Two-way bindable via ngModel, formControlName, [formField], or [(value)].',
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
      description: 'Message rendered via <s-error-message> below the textarea while invalid.',
    },
    {
      name: 'rows',
      type: 'number',
      default: '3',
      description: 'Native rows attribute -- initial visible height in text lines.',
    },
    {
      name: 'maxLength',
      type: 'number | undefined',
      default: 'undefined',
      description: 'Shows a character counter and caps native input at that length.',
    },
    {
      name: 'autoResize',
      type: 'boolean',
      default: 'false',
      description: 'Grows the textarea to fit its content instead of scrolling internally -- keeps working when the value is set programmatically, not just while typing.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the textarea. Also set automatically when the bound reactive-forms control is disabled.',
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
      description: 'Sets autocomplete="off" on the native textarea, for fields the browser shouldn\'t offer to autofill.',
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
    { name: '.s-textarea-wrapper', description: 'Positioning wrapper around the native <textarea> and the character counter.' },
    { name: '.s-textarea', description: 'The native <textarea> element carrying background, border, and typography.' },
    { name: '.s-textarea--auto-resize', description: 'Applied when autoResize is set -- disables manual resize and hides overflow.' },
    { name: '.s-textarea__count', description: 'The character counter shown in the bottom-end corner when maxLength is set.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-input-padding-y', description: 'Vertical padding.' },
    { name: '--semiui-comp-input-padding-x', description: 'Horizontal padding.' },
    { name: '--semiui-comp-input-radius', description: 'Corner radius.' },
    { name: '--semiui-comp-input-font-size', description: 'Font size.' },
    { name: '--semiui-comp-input-background', description: 'Background color.' },
    { name: '--semiui-comp-input-foreground', description: 'Text color.' },
    { name: '--semiui-comp-input-border', description: 'Border color in the resting state.' },
    { name: '--semiui-comp-input-placeholder-foreground', description: 'Placeholder and character-counter text color.' },
    { name: '--semiui-comp-input-border-hover', description: 'Border color on hover (when enabled and valid).' },
    { name: '--semiui-comp-input-border-focus', description: 'Border color while focused.' },
    { name: '--semiui-comp-input-focus-ring', description: 'Color of the focus-visible ring (rendered at 35% opacity).' },
    { name: '--semiui-comp-input-border-invalid', description: "Border color when [aria-invalid='true']." },
    { name: '--semiui-comp-input-background-disabled', description: 'Background when disabled.' },
    { name: '--semiui-comp-input-foreground-disabled', description: 'Text color when disabled.' },
  ];
}

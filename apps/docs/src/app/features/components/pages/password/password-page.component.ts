import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../components/button/button.component';
import { PasswordComponent } from '../../../../components/password/password.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-password-page',
  imports: [
    PasswordComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './password-page.component.html',
  styleUrl: './password-page.component.css',
})
export class PasswordPageComponent {
  // ngModel
  protected password = '';

  // Reactive Forms
  protected reactiveForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  protected maskEnabled = signal(true);

  toggleMask(): void {
    this.maskEnabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-password [(ngModel)]="password" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  password: new FormControl('', [Validators.required, Validators.minLength(8)]),
});

<div [formGroup]="reactiveForm">
  <s-password formControlName="password" errorMessage="Password must be at least 8 characters" />
</div>`;

  protected readonly showMaskCode = `<s-password [showMask]="false" />  <!-- no reveal button, always masked -->`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Native input placeholder text.',
    },
    {
      name: 'showMask',
      type: 'boolean',
      default: 'true',
      description: 'Whether the reveal-password toggle button is shown at all.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the input while the control is invalid.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the input and toggle button. Also settable via Signal Forms / reactive forms disabled state.',
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
      description: 'Emitted on blur, so Signal Forms / reactive forms mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-password', description: 'The wrapping element, positioned relatively so the toggle button can be placed inside the field.' },
    { name: '.s-password__input', description: 'The native input carrying background, border, and typography.' },
    { name: '.s-password__toggle', description: 'The show/hide reveal button, absolutely positioned inside the input.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-input-radius', description: 'Corner radius of the input.' },
    { name: '--semiui-comp-input-font-size', description: 'Input text size.' },
    { name: '--semiui-comp-input-padding-{x,y}', description: 'Input padding.' },
    { name: '--semiui-comp-input-background', description: 'Input background.' },
    { name: '--semiui-comp-input-foreground', description: 'Input text color.' },
    { name: '--semiui-comp-input-border', description: 'Default border color.' },
    { name: '--semiui-comp-input-border-hover', description: 'Border color on hover, while enabled and valid.' },
    { name: '--semiui-comp-input-border-focus', description: 'Border color while focused.' },
    { name: '--semiui-comp-input-focus-ring', description: 'Color of the focus-visible ring (rendered at 35% opacity).' },
    { name: '--semiui-comp-input-border-invalid', description: 'Border color while invalid.' },
    { name: '--semiui-comp-input-background-disabled', description: 'Background while disabled.' },
    { name: '--semiui-comp-input-foreground-disabled', description: 'Text color while disabled.' },
    { name: '--semiui-comp-input-placeholder-foreground', description: 'Placeholder text color, also used for the toggle button icon.' },
  ];
}

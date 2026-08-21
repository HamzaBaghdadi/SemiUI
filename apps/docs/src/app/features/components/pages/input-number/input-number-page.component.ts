import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { InputNumberComponent } from '../../../../components/input-number/input-number.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-input-number-page',
  imports: [
    InputNumberComponent,
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
  templateUrl: './input-number-page.component.html',
  styleUrl: './input-number-page.component.css',
})
export class InputNumberPageComponent {
  // ngModel
  protected quantity: number | null = 1;
  protected disabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    age: new FormControl<number | null>(null, Validators.required),
  });

  // Signal Forms
  protected profileModel = signal({ price: 19.99 });
  protected profileForm = form(this.profileModel);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-input-number [(ngModel)]="quantity" [min]="0" [max]="10" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  age: new FormControl<number | null>(null, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-input-number formControlName="age" errorMessage="Age is required." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ price: 19.99 });
protected profileForm = form(this.profileModel);

<s-input-number [formField]="profileForm.price" [step]="0.01" prefix="$" />`;

  protected readonly prefixSuffixCode = `<s-input-number prefix="$" suffix=".00" [showButtons]="false" />`;

  protected readonly buttonLayoutCode = `<s-input-number buttons="horizontal" />  <!-- default is "vertical" -->`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Placeholder text shown when the field is empty.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Text shown via s-error-message when the control is invalid.',
    },
    {
      name: 'min',
      type: 'number',
      default: 'undefined',
      description: 'Minimum value. Clamps the value itself rather than just failing validation.',
    },
    {
      name: 'max',
      type: 'number',
      default: 'undefined',
      description: 'Maximum value. Clamps the value itself rather than just failing validation.',
    },
    {
      name: 'step',
      type: 'number',
      default: '1',
      description: 'Amount incremented/decremented per button click or Arrow Up/Down keydown.',
    },
    {
      name: 'showButtons',
      type: 'boolean',
      default: 'true',
      description: 'Shows the increment/decrement buttons.',
    },
    {
      name: 'buttons',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      description: '"vertical" stacks chevrons on the trailing edge; "horizontal" puts a full-height decrement button on the lead and increment on the end, like a [-] [value] [+] stepper.',
    },
    {
      name: 'prefix',
      type: 'string',
      default: "''",
      description: 'Text rendered as a separate element before the field, not embedded in the value.',
    },
    {
      name: 'suffix',
      type: 'string',
      default: "''",
      description: 'Text rendered as a separate element after the field, not embedded in the value.',
    },
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: 'The current value -- null for an empty field, never NaN. Bindable via ngModel, reactive forms, Signal Forms, or plain [(value)].',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the field and its buttons.',
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
      description: 'Emitted on blur, so Signal Forms marks the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-input-number', description: 'The field wrapper carrying the border, background, and focus/invalid states.' },
    { name: '.s-input-number__input', description: 'The native text input.' },
    { name: '.s-input-number__affix', description: 'A prefix or suffix span flanking the input.' },
    { name: '.s-input-number__buttons', description: 'Vertical layout: the rail containing the stacked increment/decrement chevrons.' },
    { name: '.s-input-number__step--increment / --decrement', description: 'Horizontal layout: the full-height [+] / [-] stepper buttons.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-input-radius', description: 'Corner radius. Shared with Text Input.' },
    { name: '--semiui-comp-input-border', description: 'Border color.' },
    { name: '--semiui-comp-input-background', description: 'Field background.' },
    { name: '--semiui-comp-input-border-hover', description: 'Border color on hover.' },
    { name: '--semiui-comp-input-border-focus', description: 'Border color when focused.' },
    { name: '--semiui-comp-input-focus-ring', description: 'Color of the focus box-shadow ring (rendered at 35% opacity).' },
    { name: '--semiui-comp-input-border-invalid', description: 'Border color when invalid.' },
    { name: '--semiui-comp-input-background-disabled', description: 'Background when disabled.' },
    { name: '--semiui-comp-input-foreground', description: 'Text color.' },
    { name: '--semiui-comp-input-foreground-disabled', description: 'Text color when disabled.' },
    { name: '--semiui-comp-input-placeholder-foreground', description: 'Placeholder and affix text color.' },
    { name: '--semiui-comp-input-padding-x / -padding-y', description: 'Field padding.' },
    { name: '--semiui-comp-input-font-size', description: 'Field font size.' },
  ];
}

import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { SwitchComponent } from '../../../../components/switch/switch.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-switch-page',
  imports: [
    SwitchComponent,
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
  templateUrl: './switch-page.component.html',
  styleUrl: './switch-page.component.css',
})
export class SwitchPageComponent {
  // ngModel
  protected notifications = true;

  // Reactive forms
  protected reactiveForm = new FormGroup({
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  // Signal Forms
  protected profileModel = signal({ marketing: false });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-switch [(ngModel)]="notifications" label="Email notifications" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
});

<div [formGroup]="reactiveForm">
  <s-switch formControlName="terms" label="I agree to the terms" errorMessage="You must agree to continue." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ marketing: false });
protected profileForm = form(this.profileModel);

<s-switch [formField]="profileForm.marketing" label="Marketing emails" />`;

  protected readonly sizesCode = `<s-switch size="sm" />  <!-- also "md" (default) and "lg" -->`;

  protected readonly iconsCode = `<s-switch [onIcon]="{ type: 'ng-icon', name: 'lucideCheck' }" [offIcon]="{ type: 'ng-icon', name: 'lucideX' }" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'boolean',
      default: 'false',
      description: 'Whether the switch is on. Two-way bindable via [(value)], ngModel, reactive forms, or [formField].',
    },
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Text label rendered next to the track; also wired up via aria-labelledby.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Controls the track/thumb dimensions via the size-scoped tokens.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables toggling.',
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
      description: 'Message shown below the switch while the field is invalid.',
    },
    {
      name: 'onIcon',
      type: 'IconRef',
      default: 'undefined',
      description: 'Icon shown inside the thumb when on. Omitted by default -- a plain thumb.',
    },
    {
      name: 'offIcon',
      type: 'IconRef',
      default: 'undefined',
      description: 'Icon shown inside the thumb when off. Omitted by default -- a plain thumb.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the switch once, after its first render.',
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
    { name: 'data-size', description: "The active size, e.g. [data-size='sm'] -- set on the inner .s-switch__track element." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-switch', description: 'The outer wrapper containing the track and label.' },
    { name: '.s-switch__track', description: "The toggleable button; carries background/border and the [aria-checked='true'] checked styling." },
    { name: '.s-switch__thumb', description: 'The sliding circular thumb, including any on/off icon.' },
    { name: '.s-switch__label', description: 'The optional text label next to the track.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-switch-track-width-{sm,md,lg}', description: 'Track width per size.' },
    { name: '--semiui-comp-switch-track-height-{sm,md,lg}', description: 'Track height per size.' },
    { name: '--semiui-comp-switch-thumb-size-{sm,md,lg}', description: 'Thumb diameter per size.' },
    { name: '--semiui-comp-switch-track-padding', description: 'Inner padding between the track edge and the thumb.' },
    { name: '--semiui-comp-switch-track-border-width', description: 'Track border width.' },
    { name: '--semiui-comp-switch-radius', description: 'Track corner radius.' },
    { name: '--semiui-comp-switch-border', description: 'Track border color when off.' },
    { name: '--semiui-comp-switch-background', description: 'Track background when off.' },
    { name: '--semiui-comp-switch-border-checked', description: 'Track border color when on.' },
    { name: '--semiui-comp-switch-background-checked', description: 'Track background when on; also used as the thumb icon color.' },
    { name: '--semiui-comp-switch-thumb-background', description: 'Thumb background color.' },
    { name: '--semiui-comp-switch-focus-ring', description: 'Color of the focus-visible ring (rendered at 35% opacity).' },
    { name: '--semiui-comp-switch-transition-duration', description: 'Duration of the background/border/thumb-position transitions.' },
  ];
}

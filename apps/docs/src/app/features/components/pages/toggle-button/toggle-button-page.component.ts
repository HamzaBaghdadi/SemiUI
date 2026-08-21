import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucidePause, lucidePlay } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../components/button/button.component';
import { ToggleButtonComponent } from '../../../../components/toggle-button/toggle-button.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-toggle-button-page',
  imports: [
    ToggleButtonComponent,
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
  templateUrl: './toggle-button-page.component.html',
  styleUrl: './toggle-button-page.component.css',
  providers: [provideIcons({ lucidePlay, lucidePause })],
})
export class ToggleButtonPageComponent {
  // ngModel
  protected bold = true;

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

  protected readonly ngModelCode = `<s-toggle-button [(ngModel)]="bold" onLabel="Bold" offLabel="Bold" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
});

<div [formGroup]="reactiveForm">
  <s-toggle-button formControlName="terms" onLabel="Agreed" offLabel="Not agreed" errorMessage="You must agree to continue." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ marketing: false });
protected profileForm = form(this.profileModel);

<s-toggle-button [formField]="profileForm.marketing" onLabel="Subscribed" offLabel="Not subscribed" />`;

  protected readonly variantsCode = `<s-toggle-button variant="primary" onLabel="On" offLabel="Off" [(value)]="pressed" />
<s-toggle-button variant="destructive" onLabel="On" offLabel="Off" [(value)]="pressed" />`;

  protected readonly sizesCode = `<s-toggle-button size="sm" onLabel="On" offLabel="Off" />  <!-- also "md" (default) and "lg" -->`;

  protected readonly iconsCode = `<s-toggle-button
  onLabel="Playing" offLabel="Paused"
  [onIcon]="{ type: 'ng-icon', name: 'lucidePause' }"
  [offIcon]="{ type: 'ng-icon', name: 'lucidePlay' }"
/>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'boolean',
      default: 'false',
      description: 'Whether the button is pressed. Two-way bindable via [(value)], ngModel, reactive forms, or [formField].',
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'destructive' | 'link' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'",
      default: "'primary'",
      description: 'Visual style, same union as Button. Unpressed reads as outlined in this color; pressed fills solid.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Controls padding and font size via Button's size-scoped tokens.",
    },
    {
      name: 'onLabel',
      type: 'string',
      default: "'Yes'",
      description: 'Label shown while pressed.',
    },
    {
      name: 'offLabel',
      type: 'string',
      default: "'No'",
      description: 'Label shown while unpressed.',
    },
    {
      name: 'onIcon',
      type: 'IconRef',
      default: 'undefined',
      description: 'Icon shown while pressed, leading the label.',
    },
    {
      name: 'offIcon',
      type: 'IconRef',
      default: 'undefined',
      description: 'Icon shown while unpressed, leading the label.',
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
      description: 'Message shown below the button while the field is invalid.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the button once, after its first render.',
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
    { name: 'data-variant', description: "The active variant, e.g. [data-variant='primary'] -- set on the host, drives the accent/solid tokens below." },
    { name: 'data-size', description: "The active size, e.g. [data-size='md'] -- set on the host, drives padding/font-size tokens." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-toggle-button', description: 'The inner button element carrying background, border, and typography.' },
    { name: '.s-toggle-button__icon', description: 'Wraps the on/off icon.' },
    { name: '.s-toggle-button__label', description: 'Wraps the on/off label text.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-button-radius', description: "Corner radius -- reuses Button's own tokens rather than owning a comp.toggleButton block." },
    { name: '--semiui-comp-button-font-weight', description: 'Label font weight.' },
    { name: '--semiui-comp-button-focus-ring', description: 'Color of the focus-visible ring (rendered at 45% opacity).' },
    { name: '--semiui-comp-button-padding-x-{sm,md,lg}', description: 'Horizontal padding per size.' },
    { name: '--semiui-comp-button-padding-y-{sm,md,lg}', description: 'Vertical padding per size.' },
    { name: '--semiui-comp-button-font-size-{sm,md,lg}', description: 'Font size per size.' },
    {
      name: '--semiui-comp-button-variants-{variant}-{background,foreground,border}',
      description: 'Per-variant color triad, same tokens Button reads. Unpressed uses background/border as the outlined accent color; pressed fills with background/foreground/border directly.',
    },
  ];
}

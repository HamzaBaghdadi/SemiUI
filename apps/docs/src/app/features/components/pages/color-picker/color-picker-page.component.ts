import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { ColorPickerComponent } from '../../../../components/color-picker/color-picker.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-color-picker-page',
  imports: [
    ColorPickerComponent,
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
  templateUrl: './color-picker-page.component.html',
  styleUrl: './color-picker-page.component.css',
})
export class ColorPickerPageComponent {
  protected brandColor: string | null = '#3b82f6';
  protected disabled = signal(false);

  protected reactiveForm = new FormGroup({
    accent: new FormControl<string | null>(null, Validators.required),
  });

  protected profileModel = signal({ themeColor: '#ec4899' });
  protected profileForm = form(this.profileModel);

  protected inlineColor: string | null = '#22c55e';

  protected limitedPresets = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-color-picker [(ngModel)]="brandColor" />`;

  protected readonly inlineCode = `<s-color-picker [(ngModel)]="color" [inline]="true" />`;

  protected readonly presetsCode = `protected presets = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];

<s-color-picker [(ngModel)]="color" [presets]="presets" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  accent: new FormControl<string | null>(null, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-color-picker formControlName="accent" errorMessage="Please pick an accent color." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ themeColor: '#ec4899' });
protected profileForm = form(this.profileModel);

<s-color-picker [formField]="profileForm.themeColor" />`;

  protected readonly swatchOnlyCode = `<s-color-picker [(ngModel)]="color" [showPresets]="false" [showValueText]="false" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'inline',
      type: 'boolean',
      default: 'false',
      description: 'Renders the saturation/hue/hex panel directly, with no trigger button or popover.',
    },
    {
      name: 'presets',
      type: 'readonly string[]',
      default: '19 built-in swatches',
      description: 'Preset swatches shown below the picker.',
    },
    {
      name: 'showPresets',
      type: 'boolean',
      default: 'true',
      description: 'Hides the preset swatches section entirely. Passing an empty presets array does this too -- this is the more discoverable/explicit way.',
    },
    {
      name: 'showValueText',
      type: 'boolean',
      default: 'true',
      description: 'Hides the hex text next to the swatch in the trigger button, leaving just the color swatch visible.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "'Pick a color'",
      description: 'Placeholder text shown on the trigger when no color is chosen.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the picker while invalid.',
    },
    {
      name: 'value',
      type: 'string | null',
      default: 'null',
      description: 'The picked color, as a #rrggbb hex string (no alpha). A two-way model -- bindable via ngModel/formControlName/formField, or directly with [(value)].',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the trigger and closes the panel if open. Inherited from BaseFormFieldControl; also settable through reactive forms/Signal Forms.',
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
      description: 'Focuses the trigger once, after its first render -- or the hex field in inline mode, which has no trigger.',
    },
    {
      name: 'disableAutocomplete',
      type: 'boolean',
      default: 'false',
      description: 'Sets autocomplete="off" on the hex field, for fields the browser shouldn\'t offer to autofill.',
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
    { name: 'data-open', description: 'Present while the popover panel is open (absent when inline).' },
    { name: 'data-inline', description: 'Present when inline is set -- switches :host to display: inline-block.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-color-picker__trigger', description: 'The button that opens the popover, showing the swatch and (optionally) hex text.' },
    { name: '.s-color-picker__swatch', description: 'The small color preview square, in the trigger and per preset.' },
    { name: '.s-color-picker__panel', description: 'The popover panel wrapping the sv-area, hue slider, hex field, and presets.' },
    { name: '.s-color-picker__inline-panel', description: "The panel's equivalent container when inline is set." },
    { name: '.s-color-picker__sv-area', description: 'The saturation/value gradient square.' },
    { name: '.s-color-picker__sv-thumb', description: 'The draggable thumb positioned within the sv-area.' },
    { name: '.s-color-picker__hue-track', description: 'The hue gradient slider track.' },
    { name: '.s-color-picker__hue-thumb', description: 'The draggable thumb positioned along the hue track.' },
    { name: '.s-color-picker__hex-row', description: 'Wraps the "#" prefix and the typeable hex input.' },
    { name: '.s-color-picker__presets', description: 'The grid of preset swatch buttons.' },
    { name: '.s-color-picker__preset', description: 'A single preset swatch button.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-color-picker-sv-area-size', description: 'Width/height of the saturation/value square, and the panel width.' },
    { name: '--semiui-comp-color-picker-thumb-size', description: 'Diameter of the sv-area thumb.' },
    { name: '--semiui-comp-color-picker-hue-track-height', description: 'Height of the hue slider track.' },
    { name: '--semiui-comp-color-picker-hue-thumb-width', description: 'Width of the hue slider thumb.' },
    { name: '--semiui-comp-color-picker-preset-size', description: 'Width/height of each preset swatch.' },
    { name: '--semiui-comp-color-picker-preset-gap', description: 'Gap between preset swatches.' },
    { name: '--semiui-comp-color-picker-preset-border', description: 'Border color of an unselected preset swatch.' },
    { name: '--semiui-comp-color-picker-preset-border-selected', description: 'Border color of the currently-selected preset swatch.' },
    {
      name: '--semiui-comp-select-*',
      description: 'The trigger button and popover panel chrome (border, background, radius, focus ring, disabled state) intentionally reuse the Select component\'s tokens, for a consistent look across form controls.',
    },
  ];
}

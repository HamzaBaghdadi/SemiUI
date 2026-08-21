import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { SliderComponent } from '../../../../components/slider/slider.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-slider-page',
  imports: [
    SliderComponent,
    ButtonComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './slider-page.component.html',
  styleUrl: './slider-page.component.css',
})
export class SliderPageComponent {
  protected volume = 40;
  protected disabled = signal(false);

  protected reactiveForm = new FormGroup({
    budget: new FormControl<number | null>(null, Validators.required),
  });

  protected currencyFormatter = (value: number) => `$${value}`;

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-slider [(ngModel)]="volume" [min]="0" [max]="100" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  budget: new FormControl<number | null>(null, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-slider formControlName="budget" [min]="0" [max]="1000" [step]="50" errorMessage="Please set a budget." />
</div>`;

  protected readonly ticksCode = `protected currencyFormatter = (value: number) => '$' + value;

<s-slider [(ngModel)]="price" [step]="10" [showTicks]="true" [valueFormatter]="currencyFormatter" />`;

  protected readonly verticalCode = `<s-slider [(ngModel)]="value" orientation="vertical" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: "The slider's current value. Two-way bindable via [(value)], ngModel, or reactive forms.",
    },
    {
      name: 'min',
      type: 'number',
      default: '0',
      description: 'Minimum value of the range.',
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: 'Maximum value of the range.',
    },
    {
      name: 'step',
      type: 'number',
      default: '1',
      description: 'Increment between values; the arrow keys move by one step, Page Up/Page Down by ten steps.',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Layout direction of the track and thumb.',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: 'undefined',
      description: "Accessible name for the thumb, e.g. when no visible label is associated with the slider.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables dragging, clicking on the track, and keyboard interaction.',
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
      description: 'Message shown below the track while the field is invalid.',
    },
    {
      name: 'showTicks',
      type: 'boolean',
      default: 'false',
      description: 'Renders a tick mark at every step along the track.',
    },
    {
      name: 'showValueBubble',
      type: 'boolean',
      default: 'true',
      description: 'Shows a floating value bubble above the thumb while dragging or focused.',
    },
    {
      name: 'valueFormatter',
      type: '(value: number) => string',
      default: 'String(value)',
      description: 'Formats the value shown in the bubble, e.g. to add units or currency.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the thumb once, after the first render.',
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
    { name: 'data-orientation', description: "The active orientation, e.g. [data-orientation='vertical']." },
    { name: 'data-disabled', description: 'Present when the slider is disabled.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-slider__container', description: 'Padding wrapper around the track.' },
    { name: '.s-slider__track', description: 'The clickable track background.' },
    { name: '.s-slider__fill', description: "The filled portion of the track, from min up to the thumb's value." },
    { name: '.s-slider__tick', description: 'A single tick mark, rendered per step when showTicks is set.' },
    { name: '.s-slider__thumb', description: 'The draggable thumb handle.' },
    { name: '.s-slider__bubble', description: 'The floating value bubble shown above/beside the thumb.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-slider-track-size', description: 'Thickness of the track.' },
    { name: '--semiui-comp-slider-track-color', description: 'Background color of the track.' },
    { name: '--semiui-comp-slider-fill-color', description: 'Color of the filled portion of the track.' },
    { name: '--semiui-comp-slider-tick-size', description: 'Diameter of each tick mark.' },
    { name: '--semiui-comp-slider-tick-color', description: 'Color of tick marks.' },
    { name: '--semiui-comp-slider-thumb-size', description: 'Diameter of the thumb.' },
    { name: '--semiui-comp-slider-thumb-background', description: 'Background color of the thumb.' },
    { name: '--semiui-comp-slider-thumb-border', description: 'Border color of the thumb.' },
    { name: '--semiui-comp-slider-thumb-border-focus', description: 'Thumb border/focus-ring color when focus-visible.' },
    { name: '--semiui-comp-slider-bubble-background', description: 'Background color of the value bubble.' },
    { name: '--semiui-comp-slider-bubble-foreground', description: 'Text color of the value bubble.' },
  ];
}

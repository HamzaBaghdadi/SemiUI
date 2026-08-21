import { Component, viewChild } from '@angular/core';
import { ButtonComponent } from '../../../../components/button/button.component';
import { StepItem, StepperComponent } from '../../../../components/stepper/stepper.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-stepper-page',
  imports: [
    StepperComponent,
    ButtonComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './stepper-page.component.html',
  styleUrl: './stepper-page.component.css',
})
export class StepperPageComponent {
  protected checkoutSteps: StepItem[] = [
    { label: 'Cart', description: 'Review items' },
    { label: 'Shipping', description: 'Delivery address' },
    { label: 'Payment', description: 'Card details' },
    { label: 'Confirm', description: 'Place order' },
  ];

  protected readonly linearStepper = viewChild<StepperComponent<StepItem>>('linearStepper');

  goNext(): void {
    this.linearStepper()?.next();
  }

  goPrevious(): void {
    this.linearStepper()?.previous();
  }

  protected readonly basicUsageCode = `protected steps = [
  { label: 'Cart', description: 'Review items' },
  { label: 'Shipping', description: 'Delivery address' },
];

<s-stepper [items]="steps">
  <ng-template #content let-item>
    <p>Content for {{ item.label }}</p>
  </ng-template>
</s-stepper>`;

  protected readonly linearCode = `<s-stepper #stepper [items]="steps" [linear]="true">...</s-stepper>
<button (click)="stepper.previous()">Previous</button>
<button (click)="stepper.next()">Next</button>`;

  protected readonly verticalCode = `<s-stepper [items]="steps" orientation="vertical">...</s-stepper>`;

  protected disabledStepSteps: StepItem[] = [
    { label: 'Cart', description: 'Review items' },
    { label: 'Shipping', description: 'Delivery address' },
    { label: 'Gift wrap', description: 'Not offered for this order', disabled: true },
    { label: 'Payment', description: 'Card details' },
  ];

  protected readonly disabledStepCode = `protected steps = [
  { label: 'Cart' },
  { label: 'Shipping' },
  { label: 'Gift wrap', disabled: true },
  { label: 'Payment' },
];

<s-stepper [items]="steps">...</s-stepper>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly StepItem[]',
      default: '[]',
      description: "The steps to render, in order. StepItem: { label: string; description?: string; disabled?: boolean }.",
    },
    {
      name: 'activeIndex',
      type: 'number',
      default: '0',
      description: "The current step's index. Two-way bindable.",
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Layout direction of the step row.',
    },
    {
      name: 'linear',
      type: 'boolean',
      default: 'false',
      description: 'When set, clicking a step ahead of the next one is blocked -- forward progress must go through next().',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-orientation', description: "The active orientation, e.g. [data-orientation='vertical'] -- set on the host." },
    { name: 'data-state', description: "'completed' | 'active' | 'upcoming' -- set on each step, e.g. .s-stepper__step[data-state='active']." },
    { name: 'data-disabled', description: 'Present on a step when its item.disabled is true -- dims it and blocks clicking/keyboard activation.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-stepper', description: 'The row (or column, when vertical) of steps.' },
    { name: '.s-stepper__step', description: 'A single step, wrapping its circle, connector, and labels.' },
    { name: '.s-stepper__row', description: "The step's circle-button and connector, laid out inline." },
    { name: '.s-stepper__circle-button', description: 'The clickable button wrapping the circle.' },
    { name: '.s-stepper__circle', description: 'The numbered/checkmark circle indicator.' },
    { name: '.s-stepper__connector', description: 'The line between one step and the next.' },
    { name: '.s-stepper__label-group', description: 'Wraps the label and description text.' },
    { name: '.s-stepper__label', description: "The step's label text." },
    { name: '.s-stepper__description', description: "The step's optional description text." },
    { name: '.s-stepper__panel', description: 'The active step\'s content panel, rendered from the #content template.' },
    { name: '.s-stepper__panel--enter', description: 'Applied while the panel plays its enter animation on step change.' },
    { name: '.s-stepper__check--enter', description: 'Applied to the checkmark icon while it plays its enter animation.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-stepper-gap', description: 'Gap between steps.' },
    { name: '--semiui-comp-stepper-circle-size', description: 'Diameter of the step circle.' },
    { name: '--semiui-comp-stepper-font-size', description: "Font size for the circle number and step label; the description uses 85% of it." },
    { name: '--semiui-comp-stepper-circle-border', description: 'Circle border color for upcoming steps.' },
    { name: '--semiui-comp-stepper-circle-background', description: 'Circle background for upcoming steps.' },
    { name: '--semiui-comp-stepper-circle-foreground', description: 'Circle text/icon color for upcoming steps.' },
    { name: '--semiui-comp-stepper-circle-background-active', description: 'Circle background (and border) for the active step.' },
    { name: '--semiui-comp-stepper-circle-foreground-active', description: 'Circle text color for the active step.' },
    { name: '--semiui-comp-stepper-circle-background-completed', description: 'Circle background (and border) for completed steps.' },
    { name: '--semiui-comp-stepper-circle-foreground-completed', description: 'Circle text/icon color for completed steps.' },
    { name: '--semiui-comp-stepper-connector-color', description: 'Connector line color between upcoming steps.' },
    { name: '--semiui-comp-stepper-connector-color-completed', description: 'Connector line color after a completed step.' },
    { name: '--semiui-comp-stepper-label-color', description: 'Label color for upcoming steps.' },
    { name: '--semiui-comp-stepper-label-color-active', description: 'Label color for active and completed steps.' },
    { name: '--semiui-comp-stepper-description-color', description: 'Description text color.' },
  ];
}

import { Component, viewChild } from '@angular/core';
import { ButtonComponent } from '../../../../components/button/button.component';
import { StepItem, StepperComponent } from '../../../../components/stepper/stepper.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-stepper-page',
  imports: [StepperComponent, ButtonComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
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
}

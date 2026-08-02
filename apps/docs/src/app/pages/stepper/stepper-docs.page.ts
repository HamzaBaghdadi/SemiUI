import { Component, viewChild } from '@angular/core';
import { StepItem, StepperComponent } from '../../stepper/stepper.component';

@Component({
  selector: 'app-stepper-docs-page',
  imports: [StepperComponent],
  templateUrl: './stepper-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class StepperDocsPage {
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
}

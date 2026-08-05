import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { RadioGroupComponent } from '../../../../components/radio-group/radio-group.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

interface Plan {
  id: string;
  name: string;
  disabled?: boolean;
}

const PLANS: Plan[] = [
  { id: 'free', name: 'Free' },
  { id: 'pro', name: 'Pro' },
  { id: 'enterprise', name: 'Enterprise', disabled: true },
];

@Component({
  selector: 'app-radio-group-page',
  imports: [
    RadioGroupComponent,
    ButtonComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './radio-group-page.component.html',
  styleUrl: './radio-group-page.component.css',
})
export class RadioGroupPageComponent {
  protected fruits = ['Apple', 'Banana', 'Cherry'];
  protected plans = PLANS;

  // ngModel, primitive options
  protected fruit = 'Apple';

  // ngModel, option objects
  protected plan: string | undefined = 'pro';

  // Reactive forms
  protected reactiveForm = new FormGroup({
    plan: new FormControl<string | undefined>(undefined, Validators.required),
  });

  // Signal Forms
  protected profileModel = signal({ plan: 'free' });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly primitiveCode = `<s-radio-group [options]="['Apple', 'Banana', 'Cherry']" [(ngModel)]="fruit" />`;

  protected readonly objectsCode = `<s-radio-group [options]="plans" optionLabel="name" optionValue="id" optionDisabled="disabled" [(ngModel)]="selectedPlan" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  plan: new FormControl<string | undefined>(undefined, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-radio-group [options]="plans" optionLabel="name" optionValue="id" formControlName="plan" errorMessage="Please choose a plan." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ plan: 'free' });
protected profileForm = form(this.profileModel);

<s-radio-group [options]="plans" optionLabel="name" optionValue="id" [formField]="profileForm.plan" />`;

  protected readonly horizontalCode = `<s-radio-group direction="horizontal" />  <!-- default is "vertical" -->`;

  protected readonly sizesCode = `<s-radio-group size="sm" />  <!-- also "md" (default) and "lg" -->`;
}

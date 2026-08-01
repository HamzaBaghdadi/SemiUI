import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RadioGroupComponent } from '../../radio-group/radio-group.component';

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
  selector: 'app-radio-group-docs-page',
  imports: [RadioGroupComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './radio-group-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class RadioGroupDocsPage {
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
}

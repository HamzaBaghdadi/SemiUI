import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CheckboxComponent } from '../../../../components/checkbox/checkbox.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-checkbox-page',
  imports: [
    ButtonComponent,
    CheckboxComponent,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './checkbox-page.component.html',
  styleUrl: './checkbox-page.component.css',
})
export class CheckboxPageComponent {
  // ngModel
  protected subscribed = true;

  // Reactive forms
  protected reactiveForm = new FormGroup({
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  // Signal Forms
  protected profileModel = signal({ marketing: false });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);
  protected indeterminate = signal(true);

  protected readonly ngModelCode = `<s-checkbox [(ngModel)]="subscribed" label="Subscribe to updates" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
});

<div [formGroup]="reactiveForm">
  <s-checkbox formControlName="terms" label="I agree to the terms" errorMessage="You must agree to continue." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ marketing: false });
protected profileForm = form(this.profileModel);

<s-checkbox [formField]="profileForm.marketing" label="Marketing emails" />`;

  protected readonly sizesCode = `<s-checkbox size="sm" />  <!-- also "md" (default) and "lg" -->`;

  protected readonly indeterminateCode = `<s-checkbox [indeterminate]="true" label="Select all" />`;

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

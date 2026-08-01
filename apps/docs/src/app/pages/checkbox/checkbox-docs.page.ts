import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { CheckboxComponent } from '../../checkbox/checkbox.component';

@Component({
  selector: 'app-checkbox-docs-page',
  imports: [CheckboxComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './checkbox-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class CheckboxDocsPage {
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

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

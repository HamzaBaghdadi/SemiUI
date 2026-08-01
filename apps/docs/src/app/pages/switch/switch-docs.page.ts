import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { SwitchComponent } from '../../switch/switch.component';

@Component({
  selector: 'app-switch-docs-page',
  imports: [SwitchComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './switch-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class SwitchDocsPage {
  // ngModel
  protected notifications = true;

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
}

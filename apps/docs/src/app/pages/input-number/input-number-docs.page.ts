import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { InputNumberComponent } from '../../input-number/input-number.component';

@Component({
  selector: 'app-input-number-docs-page',
  imports: [InputNumberComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './input-number-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class InputNumberDocsPage {
  // ngModel
  protected quantity: number | null = 1;
  protected disabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    age: new FormControl<number | null>(null, Validators.required),
  });

  // Signal Forms
  protected profileModel = signal({ price: 19.99 });
  protected profileForm = form(this.profileModel);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

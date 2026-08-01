import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordComponent } from '../../password/password.component';

@Component({
  selector: 'app-password-docs-page',
  imports: [PasswordComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './password-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class PasswordDocsPage {
  // ngModel
  protected password = '';

  // Reactive Forms
  protected reactiveForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  protected maskEnabled = signal(true);

  toggleMask(): void {
    this.maskEnabled.update((value) => !value);
  }
}

import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { OtpComponent } from '../../otp/otp.component';

function exactLength(length: number) {
  return (control: { value: string }) => (control.value?.length === length ? null : { length: true });
}

@Component({
  selector: 'app-otp-docs-page',
  imports: [OtpComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './otp-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class OtpDocsPage {
  // ngModel
  protected code = '';
  protected disabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, exactLength(6)] }),
  });

  // Signal Forms
  protected profileModel = signal({ code: '' });
  protected profileForm = form(this.profileModel);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

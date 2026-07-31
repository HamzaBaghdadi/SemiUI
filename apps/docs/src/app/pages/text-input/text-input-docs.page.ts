import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { TextInputComponent } from '../../text-input/text-input.component';

@Component({
  selector: 'app-text-input-docs-page',
  imports: [TextInputComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './text-input-docs.page.html',
  styleUrl: './text-input-docs.page.css',
})
export class TextInputDocsPage {
  // ngModel
  protected name = 'Ada Lovelace';
  protected nameDisabled = signal(false);

  // Reactive Forms
  protected reactiveForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  // Signal Forms
  protected profileModel = signal({ username: '' });
  protected profileForm = form(this.profileModel);

  toggleNameDisabled(): void {
    this.nameDisabled.update((value) => !value);
  }
}

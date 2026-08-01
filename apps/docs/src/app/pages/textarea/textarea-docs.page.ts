import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { TextareaComponent } from '../../textarea/textarea.component';

@Component({
  selector: 'app-textarea-docs-page',
  imports: [TextareaComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './textarea-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class TextareaDocsPage {
  // ngModel
  protected bio = 'Building Zaytoon, an Angular UI library.';
  protected disabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    feedback: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(280)] }),
  });

  // Signal Forms
  protected profileModel = signal({ notes: '' });
  protected profileForm = form(this.profileModel);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

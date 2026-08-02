import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ColorPickerComponent } from '../../color-picker/color-picker.component';

@Component({
  selector: 'app-color-picker-docs-page',
  imports: [ColorPickerComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './color-picker-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class ColorPickerDocsPage {
  protected brandColor: string | null = '#3b82f6';
  protected disabled = signal(false);

  protected reactiveForm = new FormGroup({
    accent: new FormControl<string | null>(null, Validators.required),
  });

  protected profileModel = signal({ themeColor: '#ec4899' });
  protected profileForm = form(this.profileModel);

  protected inlineColor: string | null = '#22c55e';

  protected limitedPresets = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { ColorPickerComponent } from '../../../../components/color-picker/color-picker.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-color-picker-page',
  imports: [
    ColorPickerComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './color-picker-page.component.html',
  styleUrl: './color-picker-page.component.css',
})
export class ColorPickerPageComponent {
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

  protected readonly ngModelCode = `<s-color-picker [(ngModel)]="brandColor" />`;

  protected readonly inlineCode = `<s-color-picker [(ngModel)]="color" [inline]="true" />`;

  protected readonly presetsCode = `protected presets = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];

<s-color-picker [(ngModel)]="color" [presets]="presets" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  accent: new FormControl<string | null>(null, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-color-picker formControlName="accent" errorMessage="Please pick an accent color." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ themeColor: '#ec4899' });
protected profileForm = form(this.profileModel);

<s-color-picker [formField]="profileForm.themeColor" />`;

  protected readonly swatchOnlyCode = `<s-color-picker [(ngModel)]="color" [showPresets]="false" [showValueText]="false" />`;
}

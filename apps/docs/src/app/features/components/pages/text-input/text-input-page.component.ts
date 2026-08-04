import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TextInputComponent } from '../../../../components/text-input/text-input.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-text-input-page',
  imports: [
    ButtonComponent,
    TextInputComponent,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './text-input-page.component.html',
  styleUrl: './text-input-page.component.css',
})
export class TextInputPageComponent {
  // ngModel
  protected name = 'Ada Lovelace';
  protected nameDisabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  // Signal Forms
  protected profileModel = signal({ username: '' });
  protected profileForm = form(this.profileModel);

  protected readonly ngModelCode = `<s-text-input [(ngModel)]="name" [disabled]="nameDisabled()" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
});

<div [formGroup]="reactiveForm">
  <s-text-input formControlName="email" errorMessage="Enter a valid email address" />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ username: '' });
protected profileForm = form(this.profileModel);

<s-text-input [formField]="profileForm.username" />`;

  toggleNameDisabled(): void {
    this.nameDisabled.update((value) => !value);
  }
}

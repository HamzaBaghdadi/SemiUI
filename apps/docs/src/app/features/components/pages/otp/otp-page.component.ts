import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { OtpComponent } from '../../../../components/otp/otp.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-otp-page',
  imports: [
    OtpComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './otp-page.component.html',
  styleUrl: './otp-page.component.css',
})
export class OtpPageComponent {
  // ngModel
  protected code = '';
  protected disabled = signal(false);

  // Reactive forms
  // s-otp only ever writes back "" or a genuinely complete code (never a partial one), so
  // Validators.required alone is enough to mean "the code is complete".
  protected reactiveForm = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  // Signal Forms
  protected profileModel = signal({ code: '' });
  protected profileForm = form(this.profileModel);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-otp [(ngModel)]="code" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
});

<div [formGroup]="reactiveForm">
  <s-otp formControlName="code" errorMessage="Enter the full 6-digit code." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ code: '' });
protected profileForm = form(this.profileModel);

<s-otp [formField]="profileForm.code" />`;

  protected readonly variantsCode = `<s-otp [length]="4" />
<s-otp [length]="6" type="alphanumeric" />  <!-- also accepts letters, default is "numeric" -->
<s-otp [mask]="true" />  <!-- dots instead of the typed character -->`;
}

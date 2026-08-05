import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../components/button/button.component';
import { PasswordComponent } from '../../../../components/password/password.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-password-page',
  imports: [
    PasswordComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './password-page.component.html',
  styleUrl: './password-page.component.css',
})
export class PasswordPageComponent {
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

  protected readonly ngModelCode = `<s-password [(ngModel)]="password" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  password: new FormControl('', [Validators.required, Validators.minLength(8)]),
});

<div [formGroup]="reactiveForm">
  <s-password formControlName="password" errorMessage="Password must be at least 8 characters" />
</div>`;

  protected readonly showMaskCode = `<s-password [showMask]="false" />  <!-- no reveal button, always masked -->`;
}

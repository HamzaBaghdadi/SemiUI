import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { SwitchComponent } from '../../../../components/switch/switch.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-switch-page',
  imports: [
    SwitchComponent,
    ButtonComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './switch-page.component.html',
  styleUrl: './switch-page.component.css',
})
export class SwitchPageComponent {
  // ngModel
  protected notifications = true;

  // Reactive forms
  protected reactiveForm = new FormGroup({
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  // Signal Forms
  protected profileModel = signal({ marketing: false });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-switch [(ngModel)]="notifications" label="Email notifications" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
});

<div [formGroup]="reactiveForm">
  <s-switch formControlName="terms" label="I agree to the terms" errorMessage="You must agree to continue." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ marketing: false });
protected profileForm = form(this.profileModel);

<s-switch [formField]="profileForm.marketing" label="Marketing emails" />`;

  protected readonly sizesCode = `<s-switch size="sm" />  <!-- also "md" (default) and "lg" -->`;

  protected readonly iconsCode = `<s-switch [onIcon]="{ type: 'ng-icon', name: 'lucideCheck' }" [offIcon]="{ type: 'ng-icon', name: 'lucideX' }" />`;
}

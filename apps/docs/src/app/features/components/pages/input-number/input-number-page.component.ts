import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { InputNumberComponent } from '../../../../components/input-number/input-number.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-input-number-page',
  imports: [
    InputNumberComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './input-number-page.component.html',
  styleUrl: './input-number-page.component.css',
})
export class InputNumberPageComponent {
  // ngModel
  protected quantity: number | null = 1;
  protected disabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    age: new FormControl<number | null>(null, Validators.required),
  });

  // Signal Forms
  protected profileModel = signal({ price: 19.99 });
  protected profileForm = form(this.profileModel);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-input-number [(ngModel)]="quantity" [min]="0" [max]="10" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  age: new FormControl<number | null>(null, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-input-number formControlName="age" errorMessage="Age is required." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ price: 19.99 });
protected profileForm = form(this.profileModel);

<s-input-number [formField]="profileForm.price" [step]="0.01" prefix="$" />`;

  protected readonly prefixSuffixCode = `<s-input-number prefix="$" suffix=".00" [showButtons]="false" />`;

  protected readonly buttonLayoutCode = `<s-input-number buttons="horizontal" />  <!-- default is "vertical" -->`;
}

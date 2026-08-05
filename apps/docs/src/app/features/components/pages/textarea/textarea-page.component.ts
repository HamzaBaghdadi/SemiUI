import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TextareaComponent } from '../../../../components/textarea/textarea.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-textarea-page',
  imports: [
    TextareaComponent,
    ButtonComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './textarea-page.component.html',
  styleUrl: './textarea-page.component.css',
})
export class TextareaPageComponent {
  // ngModel
  protected bio = 'Building SemiUI, an Angular UI library.';
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

  protected readonly ngModelCode = `<s-textarea [(ngModel)]="bio" placeholder="Tell us about yourself" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  feedback: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(280)] }),
});

<div [formGroup]="reactiveForm">
  <s-textarea formControlName="feedback" [maxLength]="280" errorMessage="Feedback is required (max 280 characters)." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ notes: '' });
protected profileForm = form(this.profileModel);

<s-textarea [formField]="profileForm.notes" />`;

  protected readonly autoResizeCode = `<s-textarea [autoResize]="true" [rows]="2" />`;
}

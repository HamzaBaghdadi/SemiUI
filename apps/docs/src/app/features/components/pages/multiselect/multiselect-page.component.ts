import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { MultiselectComponent } from '../../../../components/multiselect/multiselect.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

interface Skill {
  code: string;
  name: string;
}

const SKILLS: Skill[] = [
  { code: 'ts', name: 'TypeScript' },
  { code: 'ng', name: 'Angular' },
  { code: 'rx', name: 'RxJS' },
  { code: 'css', name: 'CSS' },
  { code: 'node', name: 'Node.js' },
];

@Component({
  selector: 'app-multiselect-page',
  imports: [
    MultiselectComponent,
    ButtonComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    JsonPipe,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './multiselect-page.component.html',
  styleUrl: './multiselect-page.component.css',
})
export class MultiselectPageComponent {
  protected fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
  protected skills = SKILLS;

  // ngModel, primitive options
  protected selectedFruits: string[] = ['Banana'];

  // ngModel, option objects
  protected selectedSkillCodes: string[] = [];

  // Reactive forms
  protected reactiveForm = new FormGroup({
    skills: new FormControl<string[]>([], { nonNullable: true, validators: Validators.required }),
  });

  // Signal Forms
  protected profileModel = signal({ skills: ['ts', 'ng'] });
  protected profileForm = form(this.profileModel);

  // Custom templates
  protected templatedSkillCodes: string[] = ['ts', 'ng'];

  // removableChips
  protected pinnedFruits: string[] = ['Apple', 'Cherry'];

  protected disabled = signal(false);
  protected loading = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }

  protected readonly primitiveCode = `<s-multiselect [options]="['Apple', 'Banana', 'Cherry']" [(ngModel)]="selectedFruits" placeholder="Pick fruits" />`;

  protected readonly objectsCode = `<s-multiselect [options]="skills" optionLabel="name" optionValue="code" [(ngModel)]="selectedSkillCodes" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  skills: new FormControl<string[]>([], { nonNullable: true, validators: Validators.required }),
});

<div [formGroup]="reactiveForm">
  <s-multiselect [options]="skills" optionLabel="name" optionValue="code" formControlName="skills" errorMessage="Pick at least one skill." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ skills: ['ts', 'ng'] });
protected profileForm = form(this.profileModel);

<s-multiselect [options]="skills" optionLabel="name" optionValue="code" [formField]="profileForm.skills" />`;

  protected readonly customTemplatesCode = `<s-multiselect [options]="skills" optionLabel="name" optionValue="code" [(ngModel)]="selectedSkillCodes">
  <ng-template #selected let-options>
    <!-- options is the full array of selected values -->
  </ng-template>
  <ng-template #option let-option let-selected="selected">
    {{ selected ? '✓' : '' }} {{ option.name }}
  </ng-template>
  <ng-template #header><strong>Available Skills</strong></ng-template>
</s-multiselect>`;

  protected readonly removableChipsCode = `<s-multiselect [options]="fruits" [removableChips]="false" />`;

  protected readonly closeOnSelectCode = `<s-multiselect [closeOnSelect]="true" [maxChipsDisplay]="2" />`;

  protected readonly loadingCode = `<s-multiselect [loading]="true" />`;

  protected readonly appendToCode = `<s-multiselect [options]="fruits" appendTo="body" />`;
}

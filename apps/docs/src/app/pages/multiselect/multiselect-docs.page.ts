import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MultiselectComponent } from '../../multiselect/multiselect.component';

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
  selector: 'app-multiselect-docs-page',
  imports: [MultiselectComponent, FormsModule, ReactiveFormsModule, FormField, JsonPipe],
  templateUrl: './multiselect-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class MultiselectDocsPage {
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

  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

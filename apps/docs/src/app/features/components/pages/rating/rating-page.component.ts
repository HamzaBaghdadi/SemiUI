import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { RatingComponent } from '../../../../components/rating/rating.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-rating-page',
  imports: [
    RatingComponent,
    ButtonComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './rating-page.component.html',
  styleUrl: './rating-page.component.css',
})
export class RatingPageComponent {
  // ngModel
  protected stars: number | null = 3;
  protected disabled = signal(false);

  // Reactive forms
  protected reactiveForm = new FormGroup({
    stars: new FormControl<number | null>(null, Validators.required),
  });

  // Signal Forms
  protected profileModel = signal({ stars: 4 });
  protected profileForm = form(this.profileModel);

  protected readonly ngModelCode = `<s-rating [(ngModel)]="stars" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  stars: new FormControl<number | null>(null, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-rating formControlName="stars" />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ stars: 4 });
protected profileForm = form(this.profileModel);

<s-rating [formField]="profileForm.stars" />`;

  protected readonly sizesCode = `<s-rating [maxStars]="10" size="sm" />  <!-- size also "md" (default), "lg" -->`;

  protected readonly readOnlyCode = `<s-rating [ngModel]="averageRating" [readOnly]="true" />`;

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

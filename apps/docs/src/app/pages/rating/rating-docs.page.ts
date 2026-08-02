import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RatingComponent } from '../../rating/rating.component';

@Component({
  selector: 'app-rating-docs-page',
  imports: [RatingComponent, FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './rating-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class RatingDocsPage {
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

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

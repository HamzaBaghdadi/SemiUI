import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SliderComponent } from '../../slider/slider.component';

@Component({
  selector: 'app-slider-docs-page',
  imports: [SliderComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './slider-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class SliderDocsPage {
  protected volume = 40;
  protected disabled = signal(false);

  protected reactiveForm = new FormGroup({
    budget: new FormControl<number | null>(null, Validators.required),
  });

  protected currencyFormatter = (value: number) => `$${value}`;

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}

import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { SliderComponent } from '../../../../components/slider/slider.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-slider-page',
  imports: [
    SliderComponent,
    ButtonComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './slider-page.component.html',
  styleUrl: './slider-page.component.css',
})
export class SliderPageComponent {
  protected volume = 40;
  protected disabled = signal(false);

  protected reactiveForm = new FormGroup({
    budget: new FormControl<number | null>(null, Validators.required),
  });

  protected currencyFormatter = (value: number) => `$${value}`;

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `<s-slider [(ngModel)]="volume" [min]="0" [max]="100" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  budget: new FormControl<number | null>(null, Validators.required),
});

<div [formGroup]="reactiveForm">
  <s-slider formControlName="budget" [min]="0" [max]="1000" [step]="50" errorMessage="Please set a budget." />
</div>`;

  protected readonly ticksCode = `protected currencyFormatter = (value: number) => '$' + value;

<s-slider [(ngModel)]="price" [step]="10" [showTicks]="true" [valueFormatter]="currencyFormatter" />`;

  protected readonly verticalCode = `<s-slider [(ngModel)]="value" orientation="vertical" />`;
}

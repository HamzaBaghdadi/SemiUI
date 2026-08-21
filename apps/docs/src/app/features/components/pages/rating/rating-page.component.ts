import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { RatingComponent } from '../../../../components/rating/rating.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

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
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
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

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'maxStars',
      type: 'number',
      default: '5',
      description: 'Number of stars rendered.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Controls the size of each star.',
    },
    {
      name: 'readOnly',
      type: 'boolean',
      default: 'false',
      description: 'Displays the current value without allowing clicks or hover previews to change it, e.g. for showing an average rating.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the control while invalid.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables all star buttons.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Forces the invalid visual state and error message, independent of form-control validity.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the first star once, after the first render.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur, so Signal Forms / reactive forms mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-size', description: "The active size, e.g. [data-size='md'] -- drives each star's dimensions via --s-rating-size." },
    { name: 'data-disabled', description: 'Present when disabled -- dims the whole control via opacity.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-rating', description: 'The row of star buttons.' },
    { name: '.s-rating__star', description: 'Each star button.' },
    { name: '.s-rating__star--filled', description: 'Applied to stars at or below the currently displayed value (selection or hover preview).' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-rating-size-{sm,md,lg}', description: 'Star dimensions per size.' },
    { name: '--semiui-comp-rating-gap', description: 'Gap between stars.' },
    { name: '--semiui-comp-rating-empty-color', description: 'Star color when unfilled.' },
    { name: '--semiui-comp-rating-filled-color', description: 'Star color when filled (selected or hover preview).' },
  ];
}

import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AutoCompleteComponent } from '../../../../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

const FRUITS = [
  'Apple',
  'Apricot',
  'Banana',
  'Blackberry',
  'Blueberry',
  'Cherry',
  'Cranberry',
  'Grape',
  'Grapefruit',
  'Kiwi',
  'Lemon',
  'Lime',
  'Mango',
  'Orange',
  'Papaya',
  'Peach',
  'Pear',
  'Pineapple',
  'Plum',
  'Raspberry',
  'Strawberry',
  'Watermelon',
];

interface City {
  name: string;
  country: string;
}

const CITIES: City[] = [
  { name: 'London', country: 'UK' },
  { name: 'Los Angeles', country: 'USA' },
  { name: 'Lisbon', country: 'Portugal' },
  { name: 'Lyon', country: 'France' },
  { name: 'Madrid', country: 'Spain' },
  { name: 'Manila', country: 'Philippines' },
  { name: 'Melbourne', country: 'Australia' },
  { name: 'Mexico City', country: 'Mexico' },
];

@Component({
  selector: 'app-auto-complete-page',
  imports: [
    AutoCompleteComponent,
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
  templateUrl: './auto-complete-page.component.html',
  styleUrl: './auto-complete-page.component.css',
})
export class AutoCompletePageComponent {
  protected readonly fruits = FRUITS;
  protected readonly cities = CITIES;

  // ngModel
  protected fruit = '';

  // Reactive forms
  protected reactiveForm = new FormGroup({
    fruit: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  // Signal Forms
  protected profileModel = signal({ favoriteFruit: 'Mango' });
  protected profileForm = form(this.profileModel);

  // Async/server-driven demo
  protected asyncResults = signal<City[]>([]);
  protected asyncLoading = signal(false);
  private searchTimer?: ReturnType<typeof setTimeout>;

  onAsyncSearch(query: string): void {
    clearTimeout(this.searchTimer);
    if (query.trim().length === 0) {
      this.asyncResults.set([]);
      this.asyncLoading.set(false);
      return;
    }
    this.asyncLoading.set(true);
    this.searchTimer = setTimeout(() => {
      const q = query.trim().toLowerCase();
      this.asyncResults.set(CITIES.filter((city) => city.name.toLowerCase().includes(q)));
      this.asyncLoading.set(false);
    }, 400);
  }

  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly ngModelCode = `protected fruits = ['Apple', 'Apricot', 'Banana', 'Blackberry', /* ... */];

<s-auto-complete [options]="fruits" [(ngModel)]="fruit" placeholder="Type a fruit" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  fruit: new FormControl('', { nonNullable: true, validators: Validators.required }),
});

<div [formGroup]="reactiveForm">
  <s-auto-complete [options]="fruits" formControlName="fruit" placeholder="Type a fruit" errorMessage="Pick a fruit to continue." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ favoriteFruit: 'Mango' });
protected profileForm = form(this.profileModel);

<s-auto-complete [options]="fruits" [formField]="profileForm.favoriteFruit" placeholder="Type a fruit" />`;

  protected readonly objectOptionsCode = `protected cities = [
  { name: 'London', country: 'UK' },
  { name: 'Los Angeles', country: 'USA' },
  { name: 'Lisbon', country: 'Portugal' },
];

<s-auto-complete [options]="cities" optionLabel="name" placeholder="Type a city" />`;

  protected readonly asyncCode = `protected asyncResults = signal<City[]>([]);
protected asyncLoading = signal(false);

onSearch(query: string): void {
  this.asyncLoading.set(true);
  // ...call your API, then:
  this.asyncResults.set(results);
  this.asyncLoading.set(false);
}

<s-auto-complete
  [options]="asyncResults()"
  [loading]="asyncLoading()"
  (search)="onSearch($event)"
  optionLabel="name"
  placeholder="Type a city"
/>`;

  protected readonly appendToCode = `<s-auto-complete [options]="fruits" appendTo="body" placeholder="Type a fruit" class="w-56" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'string',
      default: "''",
      description: 'The current text -- whatever the user has typed, not constrained to one of options. Two-way bindable via [(value)], ngModel, reactive forms, or [formField].',
    },
    {
      name: 'options',
      type: 'readonly TOption[]',
      default: '[]',
      description: 'Candidate suggestions, filtered client-side by substring match against optionLabel. For async/server-driven results, rebind this from the (search) output instead of relying on the built-in filter.',
    },
    {
      name: 'optionLabel',
      type: 'string',
      default: 'undefined',
      description: "Property to read each option's display label (and, on selection, the text filled into the input) from. Omit for primitive (string) options.",
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Placeholder text shown while empty.',
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'true',
      description: 'Shows a clear ("x") affordance once there\'s text.',
    },
    {
      name: 'minChars',
      type: 'number',
      default: '1',
      description: 'Minimum characters typed before the panel (and filtering) activates.',
    },
    {
      name: 'emptyMessage',
      type: 'string',
      default: "'No results found'",
      description: 'Shown in the panel when nothing matches.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: "Shows a spinner, for async suggestion loading. Doesn't disable the input -- typing stays live while a search is in flight, since the user may keep refining their query before results land.",
    },
    {
      name: 'appendTo',
      type: "'body' | null",
      default: 'null',
      description: "Moves the panel to a direct child of document.body, escaping any ancestor's overflow: hidden clipping.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the input.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Marks the field invalid; also derived automatically from a touched/dirty reactive-forms control.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message shown below the input while the field is invalid.',
    },
    {
      name: '#option template context',
      type: '{ $implicit: TOption; index: number; query: string }',
      description: 'Custom rendering for each suggestion row.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the field once, after its first render.',
    },
    {
      name: 'disableAutocomplete',
      type: 'boolean',
      default: 'false',
      description: 'Sets autocomplete="off" on the native input, for fields the browser shouldn\'t offer to autofill.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'search',
      type: 'EventEmitter<string>',
      description: 'Emitted with the current query on every keystroke -- the hook for async/server-driven suggestions.',
    },
    {
      name: 'optionSelected',
      type: 'EventEmitter<TOption>',
      description: 'Emitted with the full option object when a suggestion is picked (vs. free-typed text the user never selected from the list).',
    },
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur, so Signal Forms / reactive forms can mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-open', description: 'Present on the host while the suggestions panel is open.' },
    { name: 'data-active', description: 'Present on the keyboard-highlighted option.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-auto-complete__input', description: 'The native text input carrying background/border and typography.' },
    { name: '.s-auto-complete__panel', description: 'The floating suggestions list.' },
    { name: '.s-auto-complete__option', description: 'A single suggestion row.' },
    { name: '.s-auto-complete__clear', description: 'The clear ("x") affordance.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-comp-input-*',
      description: "Reuses Text Input's own tokens for the field itself -- padding, radius, font-size, background/foreground/border (rest, hover, focus, invalid, disabled).",
    },
    {
      name: '--semiui-comp-select-*',
      description: "Reuses Select's own panel/option tokens for the suggestions dropdown -- panel background/border/shadow, option hover color. Neither owns a comp.autoComplete block of its own.",
    },
  ];
}

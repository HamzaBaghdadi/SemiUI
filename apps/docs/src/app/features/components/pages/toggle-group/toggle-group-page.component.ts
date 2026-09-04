import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideAlignCenter, lucideAlignLeft, lucideAlignRight, lucideBold, lucideItalic, lucideUnderline } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../components/button/button.component';
import { ToggleGroupComponent, ToggleGroupItem } from '../../../../components/toggle-group/toggle-group.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-toggle-group-page',
  imports: [
    ToggleGroupComponent,
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
  templateUrl: './toggle-group-page.component.html',
  styleUrl: './toggle-group-page.component.css',
  providers: [provideIcons({ lucideAlignLeft, lucideAlignCenter, lucideAlignRight, lucideBold, lucideItalic, lucideUnderline })],
})
export class ToggleGroupPageComponent {
  protected readonly alignItems: ToggleGroupItem<string>[] = [
    { label: 'Left', value: 'left', icon: { type: 'ng-icon', name: 'lucideAlignLeft' } },
    { label: 'Center', value: 'center', icon: { type: 'ng-icon', name: 'lucideAlignCenter' } },
    { label: 'Right', value: 'right', icon: { type: 'ng-icon', name: 'lucideAlignRight' } },
  ];

  protected readonly formatItems: ToggleGroupItem<string>[] = [
    { label: 'Bold', value: 'bold', icon: { type: 'ng-icon', name: 'lucideBold' } },
    { label: 'Italic', value: 'italic', icon: { type: 'ng-icon', name: 'lucideItalic' } },
    { label: 'Underline', value: 'underline', icon: { type: 'ng-icon', name: 'lucideUnderline' } },
  ];

  protected readonly planItems: ToggleGroupItem<string>[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise', disabled: true },
  ];

  // ngModel, single-select
  protected align = 'left';

  // ngModel, multi-select
  protected formats: string[] = ['bold'];

  // Reactive forms
  protected reactiveForm = new FormGroup({
    plan: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  // Signal Forms
  protected profileModel = signal({ align: 'center' });
  protected profileForm = form(this.profileModel);

  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected paddedAlign = 'center';

  /** The variables `paddedTrackCode`'s preset generates, applied inline by the demo -- the docs app
   * can't install a second preset at runtime, so the demo applies what one would compile to.
   * Verified against `buildThemeVars(definePreset(Semi, ...))`; if the snippet below changes,
   * these change with it. */
  protected readonly paddedTrackVars: Record<string, string> = {
    '--semiui-comp-toggle-group-background': 'var(--semiui-color-muted)',
    '--semiui-comp-toggle-group-border-width': '1px',
    '--semiui-comp-toggle-group-radius': 'var(--semiui-radius-md)',
    '--semiui-comp-toggle-group-padding': '0.25rem',
    '--semiui-comp-toggle-group-gap': '0.25rem',
    '--semiui-comp-toggle-group-item-border-width': '0px',
    '--semiui-comp-toggle-group-item-radius': 'var(--semiui-radius-sm)',
    '--semiui-comp-toggle-group-item-radius-outer': 'var(--semiui-radius-sm)',
    '--semiui-comp-toggle-group-item-padding-x-md': '1rem',
    '--semiui-comp-toggle-group-item-padding-y-md': '0.25rem',
  };

  protected readonly paddedTrackCode = `import { definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

export const MyTheme = definePreset(Semi, {
  components: {
    toggleGroup: {
      // the track: a filled, bordered, padded container
      background: '{muted}',
      borderWidth: '1px',
      radius: '{radius.md}',
      padding: '0.25rem',
      gap: '0.25rem',
      // the segments: borderless pills, uniformly rounded
      itemBorderWidth: '0px',
      itemRadius: '{radius.sm}',
      itemRadiusOuter: '{radius.sm}',
      itemPaddingX: { md: '1rem' },
      itemPaddingY: { md: '0.25rem' },
    },
  },
});`;

  protected readonly fluidCode = `<s-toggle-group [(ngModel)]="align" [items]="alignItems" [fluid]="true" />`;

  protected readonly ngModelCode = `protected align = 'left';

<s-toggle-group [items]="alignItems" [(ngModel)]="align" />`;

  protected readonly multipleCode = `protected formats: string[] = ['bold'];

<s-toggle-group multiple [items]="formatItems" [(ngModel)]="formats" />`;

  protected readonly reactiveFormsCode = `protected reactiveForm = new FormGroup({
  plan: new FormControl('', { nonNullable: true, validators: Validators.required }),
});

<div [formGroup]="reactiveForm">
  <s-toggle-group [items]="planItems" formControlName="plan" errorMessage="Pick a plan to continue." />
</div>`;

  protected readonly signalFormsCode = `protected profileModel = signal({ align: 'center' });
protected profileForm = form(this.profileModel);

<s-toggle-group [items]="alignItems" [formField]="profileForm.align" />`;

  protected readonly sizesCode = `<s-toggle-group size="sm" [items]="alignItems" [(value)]="align" />  <!-- also "md" (default) and "lg" -->`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly ToggleGroupItem<TValue>[]',
      default: '[]',
      description: 'The segments to render. ToggleGroupItem is { label, value, icon?, disabled? }.',
    },
    {
      name: 'value',
      type: 'TValue | TValue[]',
      default: 'undefined | []',
      description: "The selected item value (single mode) or values (multiple mode). Two-way bindable via [(value)], ngModel, reactive forms, or [formField].",
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'Allows more than one segment to be selected at once, independently toggled. Single mode is exclusive and click-to-clear.',
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'destructive' | 'link' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'",
      default: "'primary'",
      description: 'Visual style, same union as Button. Unselected segments read outlined in this color; selected segments fill solid.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Controls padding and font size via Button's size-scoped tokens.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the whole group.',
    },
    {
      name: 'allowEmpty',
      type: 'boolean',
      default: 'true',
      description: 'Allows the group to have no selected items.',
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
      description: 'Message shown below the group while the field is invalid.',
    },
    {
      name: 'fluid',
      type: 'boolean',
      default: 'false',
      description: 'Stretches the group to fill its container, with its segments dividing the width evenly.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the selected segment once, after the first render -- or the first segment if none is selected.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur, so Signal Forms / reactive forms can mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-fluid', description: 'Present on the host when fluid is set -- switches it to full-container width.' },
    { name: 'data-variant', description: "The active variant, e.g. [data-variant='primary'] -- set on the host, drives the accent/solid tokens below." },
    { name: 'data-size', description: "The active size, e.g. [data-size='md'] -- set on the host, drives padding/font-size tokens." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-toggle-group', description: 'The track holding the segments -- background, border, radius, padding and gap all come from tokens, so it is invisible by default and a real container once a preset turns it on.' },
    { name: '.s-toggle-group__item', description: 'A single segment button. In the default (joined) style it shares a collapsed border with its neighbors and only the first/last segment is rounded.' },
    { name: '.s-toggle-group__icon', description: "Wraps a segment's icon." },
    { name: '.s-toggle-group__label', description: "Wraps a segment's label text." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-comp-toggle-group-{background,border,border-width,radius,padding,gap}',
      description: 'The track. All transparent/zero by default, so there is no visible container at all and the segments read as one joined row. Turning them up is what produces the padded segmented-control style.',
    },
    {
      name: '--semiui-comp-toggle-group-item-{background,border-width,radius,gap}',
      description: "A segment's own chrome. item-radius is 0 by default (square inner seams) and item-gap is the space between a segment's icon and its label.",
    },
    {
      name: '--semiui-comp-toggle-group-item-radius-outer',
      description: "The first and last segment's outer corners -- the ends of the group. Separate from item-radius so the joined default rounds the ends without rounding the shared seams; set both the same for uniformly rounded segments.",
    },
    { name: '--semiui-comp-toggle-group-item-padding-{x,y}-{sm,md,lg}', description: 'Segment padding per size. Defaults to Button\'s, so changing Button moves it unless a preset overrides it here.' },
    { name: '--semiui-comp-toggle-group-item-font-size-{sm,md,lg}', description: "Segment font size per size. Defaults to Button's." },
    { name: '--semiui-comp-toggle-group-font-weight', description: "Segment label font weight. Defaults to Button's." },
    { name: '--semiui-comp-toggle-group-focus-ring', description: "Color of the focus-visible ring (rendered at 45% opacity). Defaults to Button's." },
    { name: '--semiui-comp-toggle-group-opacity-disabled', description: "Opacity of a disabled segment. Defaults to Button's." },
    {
      name: '--semiui-comp-button-variants-{variant}-{background,foreground,border}',
      description: "Per-variant color triad, deliberately still Button's: a Toggle Group's \"primary\" is Button's primary, and copying the ramp here would be a second source of truth. Unselected uses background/border as the outlined accent color; selected fills with background/foreground/border directly.",
    },
  ];
}

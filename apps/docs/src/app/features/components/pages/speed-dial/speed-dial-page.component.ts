import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideFilePlus, lucidePencil, lucideShare2, lucideTrash2 } from '@ng-icons/lucide';
import { SpeedDialComponent, SpeedDialItem } from '../../../../components/speed-dial/speed-dial.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-speed-dial-page',
  imports: [
    SpeedDialComponent,
    ButtonComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './speed-dial-page.component.html',
  styleUrl: './speed-dial-page.component.css',
  providers: [provideIcons({ lucideFilePlus, lucidePencil, lucideCopy, lucideShare2, lucideTrash2 })],
})
export class SpeedDialPageComponent {
  protected readonly items: SpeedDialItem[] = [
    { label: 'New', icon: { type: 'ng-icon', name: 'lucideFilePlus' } },
    { label: 'Edit', icon: { type: 'ng-icon', name: 'lucidePencil' } },
    { label: 'Duplicate', icon: { type: 'ng-icon', name: 'lucideCopy' } },
    { label: 'Share', icon: { type: 'ng-icon', name: 'lucideShare2' } },
    { label: 'Delete', icon: { type: 'ng-icon', name: 'lucideTrash2' }, disabled: true },
  ];

  protected lastSelected = signal<string | null>(null);
  protected disabled = signal(false);

  onSelect(item: SpeedDialItem): void {
    this.lastSelected.set(item.label);
  }

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly basicCode = `protected items: SpeedDialItem[] = [
  { label: 'New', icon: { type: 'ng-icon', name: 'lucideFilePlus' } },
  { label: 'Edit', icon: { type: 'ng-icon', name: 'lucidePencil' } },
  { label: 'Share', icon: { type: 'ng-icon', name: 'lucideShare2' } },
];

<s-speed-dial [items]="items" (itemSelected)="onSelect($event)" />`;

  protected readonly directionsCode = `<s-speed-dial direction="up" [items]="items" />
<s-speed-dial direction="down" [items]="items" />
<s-speed-dial direction="left" [items]="items" />
<s-speed-dial direction="right" [items]="items" />`;

  protected readonly variantsCode = `<s-speed-dial variant="secondary" [items]="items" />
<s-speed-dial variant="destructive" [items]="items" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly SpeedDialItem[]',
      default: '[]',
      description: 'The actions to fan out. SpeedDialItem is { label, icon?, disabled? }.',
    },
    {
      name: 'direction',
      type: "'up' | 'down' | 'left' | 'right'",
      default: "'up'",
      description: 'Which way the actions fan out from the trigger.',
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'destructive' | 'link' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'",
      default: "'primary'",
      description: "The trigger's color, same union as Button.",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "The trigger's size, same union as Button.",
    },
    {
      name: 'icon',
      type: 'IconRef',
      default: "icons.plus",
      description: "The trigger's icon while closed.",
    },
    {
      name: 'openIcon',
      type: 'IconRef',
      default: 'icons.clear',
      description: "The trigger's icon while open.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the trigger, preventing the dial from opening.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'itemSelected',
      type: 'EventEmitter<SpeedDialItem>',
      description: 'Emitted with the item when an action is picked. The dial closes immediately after.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-direction', description: "The active direction, e.g. [data-direction='up'] -- set on the host, drives which side the actions fan out toward." },
    { name: 'data-open', description: 'Present while the dial is expanded.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-speed-dial__trigger', description: 'The main floating action button (a composed Button, icon-only and pill-shaped).' },
    { name: '.s-speed-dial__actions', description: 'The row/column of fanned-out mini action buttons.' },
    { name: '.s-speed-dial__action', description: 'A single mini action button.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-popover-shadow', description: "Elevation for both the trigger and each action -- reused from Popover's own floating-panel token." },
    { name: '--semiui-comp-button-variants-secondary-{background,foreground,border}', description: "Each mini action button's resting color triad." },
    { name: '--semiui-comp-button-focus-ring', description: 'Color of the focus-visible ring on each action (rendered at 45% opacity).' },
    { name: '--s-speed-dial-index', description: "Set per action from its list index; drives the staggered fan-out transition-delay. Not meant to be overridden directly." },
  ];
}

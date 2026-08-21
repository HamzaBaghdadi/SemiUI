import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy, lucidePencil, lucideScissors, lucideShare2, lucideTrash2 } from '@ng-icons/lucide';
import { ContextMenuComponent, ContextMenuItem } from '../../../../components/context-menu/context-menu.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-context-menu-page',
  imports: [
    ContextMenuComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './context-menu-page.component.html',
  styleUrl: './context-menu-page.component.css',
  providers: [provideIcons({ lucideCopy, lucidePencil, lucideScissors, lucideShare2, lucideTrash2 })],
})
export class ContextMenuPageComponent {
  protected readonly log = signal('');

  protected readonly basicItems: ContextMenuItem[] = [
    { label: 'Copy', icon: { type: 'ng-icon', name: 'lucideCopy' } },
    { label: 'Cut', icon: { type: 'ng-icon', name: 'lucideScissors' } },
    { separator: true },
    { label: 'Rename', icon: { type: 'ng-icon', name: 'lucidePencil' } },
    { label: 'Delete', icon: { type: 'ng-icon', name: 'lucideTrash2' }, disabled: true },
  ];

  protected readonly nestedItems: ContextMenuItem[] = [
    { label: 'Copy', icon: { type: 'ng-icon', name: 'lucideCopy' } },
    {
      label: 'Share',
      icon: { type: 'ng-icon', name: 'lucideShare2' },
      items: [
        { label: 'Email' },
        { label: 'Link' },
        {
          label: 'Social',
          items: [{ label: 'Twitter / X' }, { label: 'LinkedIn' }, { label: 'Facebook' }],
        },
      ],
    },
    { separator: true },
    { label: 'Delete', icon: { type: 'ng-icon', name: 'lucideTrash2' } },
  ];

  onSelect(item: ContextMenuItem): void {
    this.log.set(`Selected: ${item.label}`);
  }

  protected readonly basicCode = `protected items = [
  { label: 'Copy', icon: { type: 'ng-icon', name: 'lucideCopy' } },
  { label: 'Cut', icon: { type: 'ng-icon', name: 'lucideScissors' } },
  { separator: true },
  { label: 'Rename', icon: { type: 'ng-icon', name: 'lucidePencil' } },
  { label: 'Delete', icon: { type: 'ng-icon', name: 'lucideTrash2' }, disabled: true },
];

<s-context-menu [items]="items" (itemSelected)="onSelect($event)">
  <div class="rounded-lg border p-8 text-center">Right-click me</div>
</s-context-menu>`;

  protected readonly nestedCode = `protected items = [
  { label: 'Copy', icon: { type: 'ng-icon', name: 'lucideCopy' } },
  {
    label: 'Share',
    icon: { type: 'ng-icon', name: 'lucideShare2' },
    items: [
      { label: 'Email' },
      { label: 'Link' },
      { label: 'Social', items: [{ label: 'Twitter / X' }, { label: 'LinkedIn' }, { label: 'Facebook' }] },
    ],
  },
  { separator: true },
  { label: 'Delete', icon: { type: 'ng-icon', name: 'lucideTrash2' } },
];

<s-context-menu [items]="items" (itemSelected)="onSelect($event)">
  <div class="rounded-lg border p-8 text-center">Right-click me -- try Share</div>
</s-context-menu>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly ContextMenuItem[]',
      default: '[]',
      description:
        'ContextMenuItem: { label?: string; icon?: IconRef; disabled?: boolean; separator?: boolean; items?: ContextMenuItem[] }. items opens a submenu on hover, any depth.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'itemSelected',
      type: 'EventEmitter<ContextMenuItem>',
      description: 'Emitted with the picked leaf entry (not fired for items that only open a submenu).',
    },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-context-menu__overlay', description: 'The fixed-position wrapper, placed at the cursor.' },
    { name: '.s-context-menu-panel__list', description: "One level's <ul> -- the root and every submenu are the same element." },
    { name: '.s-context-menu-panel__item', description: 'A single row.' },
    { name: '.s-context-menu-panel__separator', description: 'A divider row.' },
    { name: '.s-context-menu-panel__caret', description: "The '›' shown on items with a submenu." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-popover-*', description: "Reused for the panel's background/border/radius/shadow -- both are floating-above-the-page UI." },
    { name: '--semiui-comp-select-*', description: 'Reused for item colors (hover, foreground, font size), same as Split Button\'s own menu.' },
  ];
}

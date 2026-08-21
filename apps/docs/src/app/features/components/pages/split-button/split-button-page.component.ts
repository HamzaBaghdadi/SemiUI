import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideDownload, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { SplitButtonComponent, SplitButtonItem } from '../../../../components/split-button/split-button.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-split-button-page',
  imports: [
    SplitButtonComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './split-button-page.component.html',
  styleUrl: './split-button-page.component.css',
  providers: [provideIcons({ lucideDownload, lucideCopy, lucidePencil, lucideTrash2 })],
})
export class SplitButtonPageComponent {
  protected readonly exportItems: SplitButtonItem[] = [
    { label: 'Export as CSV', icon: { type: 'ng-icon', name: 'lucideDownload' } },
    { label: 'Export as PDF', icon: { type: 'ng-icon', name: 'lucideDownload' } },
    { label: 'Duplicate', icon: { type: 'ng-icon', name: 'lucideCopy' } },
    { label: 'Rename', icon: { type: 'ng-icon', name: 'lucidePencil' }, disabled: true },
    { label: 'Delete', icon: { type: 'ng-icon', name: 'lucideTrash2' } },
  ];

  protected readonly log = signal('');

  onPressed(): void {
    this.log.set('Main action pressed');
  }

  onItemSelected(item: SplitButtonItem): void {
    this.log.set(`Selected: ${item.label}`);
  }

  protected readonly basicCode = `protected items = [
  { label: 'Export as CSV', icon: { type: 'ng-icon', name: 'lucideDownload' } },
  { label: 'Export as PDF', icon: { type: 'ng-icon', name: 'lucideDownload' } },
  { label: 'Duplicate', icon: { type: 'ng-icon', name: 'lucideCopy' } },
  { label: 'Rename', icon: { type: 'ng-icon', name: 'lucidePencil' }, disabled: true },
  { label: 'Delete', icon: { type: 'ng-icon', name: 'lucideTrash2' } },
];

<s-split-button [items]="items" (pressed)="onPressed()" (itemSelected)="onItemSelected($event)">
  Save
</s-split-button>`;

  protected readonly variantsCode = `<s-split-button variant="secondary" [items]="items">Save</s-split-button>
<s-split-button variant="destructive" [items]="items">Delete</s-split-button>`;

  protected readonly sizesCode = `<s-split-button size="sm" [items]="items">Save</s-split-button>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly SplitButtonItem[]',
      default: '[]',
      description: "The menu's entries: { label: string; icon?: IconRef; disabled?: boolean }.",
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'destructive' | 'link' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'",
      default: "'primary'",
      description: "Same variant union as Button, applied to both the main action and the caret toggle.",
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
      description: 'Disables both the main action and the caret toggle.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows a spinner on the main action and disables both segments.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'pressed',
      type: 'EventEmitter<void>',
      description: 'Emitted when the main (left) action is pressed.',
    },
    {
      name: 'itemSelected',
      type: 'EventEmitter<SplitButtonItem>',
      description: 'Emitted with the picked entry when a menu item (that is not disabled) is clicked.',
    },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-split-button__group', description: 'The flex row holding the two button segments; align-items: stretch keeps them equal height.' },
    { name: '.s-split-button__main', description: 'The main action -- a native button, squares off its trailing corners.' },
    { name: '.s-split-button__toggle', description: "The caret toggle -- a native button, squares off its leading corners and overlaps the shared border by 1px." },
    { name: '.s-split-button__menu', description: 'The menu list rendered inside the Popover.' },
    { name: '.s-split-button__menu-item', description: 'A single menu row.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--s-split-button-bg / --s-split-button-border / --s-split-button-fg',
      description: "This component's own custom properties -- each variant block points them at Button's matching --semiui-comp-button-variants-*-* tokens.",
    },
    {
      name: '--semiui-comp-button-*',
      description: 'Padding, font size, radius, and the disabled/focus-ring tokens are reused directly from Button.',
    },
    {
      name: '--semiui-comp-select-*',
      description: 'Reused for the menu item colors (hover, foreground) via the composed <s-popover>.',
    },
  ];
}

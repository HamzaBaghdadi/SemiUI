import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TabItem, TabsComponent } from '../../../../components/tabs/tabs.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-tabs-page',
  imports: [
    TabsComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './tabs-page.component.html',
  styleUrl: './tabs-page.component.css',
})
export class TabsPageComponent {
  protected accountTabs: TabItem[] = [
    { label: 'Profile' },
    { label: 'Billing' },
    { label: 'Notifications', disabled: true },
    { label: 'Advanced settings' },
  ];

  protected controlledIndex = signal(0);

  goToBilling(): void {
    this.controlledIndex.set(1);
  }

  protected readonly basicUsageCode = `protected items = [
  { label: 'Profile' },
  { label: 'Billing' },
  { label: 'Notifications', disabled: true },
];

<s-tabs [items]="items">
  <ng-template #content let-item>
    <p>Content for {{ item.label }}</p>
  </ng-template>
</s-tabs>`;

  protected readonly controlledCode = `protected activeIndex = signal(0);

<s-tabs [items]="items" [(activeIndex)]="activeIndex" />`;

  protected readonly verticalCode = `<s-tabs [items]="items" orientation="vertical">...</s-tabs>`;

  protected readonly customLabelCode = `<s-tabs [items]="items">
  <ng-template #label let-item let-i="index">
    <strong>{{ i + 1 }}.</strong> {{ item.label }}
  </ng-template>
  <ng-template #content let-item>...</ng-template>
</s-tabs>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly TabItem[]',
      default: '[]',
      description: 'The tabs to render, in order. TabItem: { label: string; disabled?: boolean }.',
    },
    {
      name: 'activeIndex',
      type: 'number',
      default: '0',
      description: 'The selected tab\'s index. Two-way bindable.',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Layout direction of the tab list; vertical also switches the container to a two-column grid (tab list + panel).',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-orientation', description: "The active orientation, e.g. [data-orientation='vertical'] -- set on the host." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-tabs__list', description: "The tablist row (or column, when vertical), bottom/end-bordered." },
    { name: '.s-tabs__tab', description: "A single tab button; [aria-selected='true'] marks the active one, :disabled the disabled ones." },
    { name: '.s-tabs__indicator', description: "The sliding bar, positioned via inline transform/width/height measured from the active tab's real rendered box." },
    { name: '.s-tabs__panel', description: 'The active panel, rendered from the required #content template.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-tabs-gap', description: 'Gap between tabs in the list.' },
    { name: '--semiui-comp-tabs-border', description: "The tablist's bottom (or inline-end, vertical) border color." },
    { name: '--semiui-comp-tabs-padding-x', description: 'Horizontal padding of each tab.' },
    { name: '--semiui-comp-tabs-padding-y', description: 'Vertical padding of each tab.' },
    { name: '--semiui-comp-tabs-font-size', description: 'Font size of tab labels.' },
    { name: '--semiui-comp-tabs-font-weight', description: 'Font weight of tab labels.' },
    { name: '--semiui-comp-tabs-foreground', description: 'Text color of inactive tabs.' },
    { name: '--semiui-comp-tabs-foreground-active', description: 'Text color of the hovered/active tab.' },
    { name: '--semiui-comp-tabs-foreground-disabled', description: 'Text color of disabled tabs.' },
    { name: '--semiui-comp-tabs-indicator-color', description: 'Color of the sliding indicator bar.' },
    { name: '--semiui-comp-tabs-indicator-thickness', description: 'Thickness of the indicator bar (height when horizontal, width when vertical).' },
  ];
}

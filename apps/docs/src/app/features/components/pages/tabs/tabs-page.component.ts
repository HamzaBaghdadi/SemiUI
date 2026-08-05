import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TabItem, TabsComponent } from '../../../../components/tabs/tabs.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-tabs-page',
  imports: [
    TabsComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
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
}

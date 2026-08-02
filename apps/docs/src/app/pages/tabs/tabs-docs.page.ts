import { Component, signal } from '@angular/core';
import { TabItem, TabsComponent } from '../../tabs/tabs.component';

@Component({
  selector: 'app-tabs-docs-page',
  imports: [TabsComponent],
  templateUrl: './tabs-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class TabsDocsPage {
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
}

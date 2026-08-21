import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, contentChild } from '@angular/core';
import { TabItem, TabsComponent } from '../../../../components/tabs/tabs.component';

const PAGE_TABS: TabItem[] = [{ label: 'Features' }, { label: 'API' }, { label: 'Theming' }];

/**
 * The Features / API / Theming tab strip every component reference page is built on. Consumers
 * project three `ng-template`s (`#features`, `#api`, `#theming`) -- same content-slot convention
 * as Tabs' own `#content`.
 */
@Component({
  selector: 'app-component-page-tabs',
  imports: [TabsComponent, NgTemplateOutlet],
  templateUrl: './component-page-tabs.component.html',
  styleUrl: './component-page-tabs.component.css',
})
export class ComponentPageTabsComponent {
  protected readonly tabs = PAGE_TABS;

  featuresTemplate = contentChild.required<unknown, TemplateRef<void>>('features', { read: TemplateRef });
  apiTemplate = contentChild.required<unknown, TemplateRef<void>>('api', { read: TemplateRef });
  themingTemplate = contentChild.required<unknown, TemplateRef<void>>('theming', { read: TemplateRef });
}

import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideBox, lucideCheck, lucideCreditCard, lucidePackageCheck, lucideTruck } from '@ng-icons/lucide';
import { TimelineComponent, TimelineItem } from '../../../../components/timeline/timeline.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-timeline-page',
  imports: [
    TimelineComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './timeline-page.component.html',
  styleUrl: './timeline-page.component.css',
  providers: [provideIcons({ lucideBox, lucideCheck, lucideCreditCard, lucidePackageCheck, lucideTruck })],
})
export class TimelinePageComponent {
  protected readonly basicItems: TimelineItem[] = [
    { title: 'Order placed', date: 'Jan 10, 2026', content: 'Your order was received and is awaiting payment.' },
    { title: 'Payment confirmed', date: 'Jan 10, 2026', content: 'Card charge succeeded.' },
    { title: 'Shipped', date: 'Jan 12, 2026', content: 'Package handed to the carrier.' },
    { title: 'Delivered', date: 'Jan 15, 2026', content: 'Left at the front door.' },
  ];

  protected readonly coloredItems: TimelineItem[] = [
    { title: 'Order placed', date: 'Jan 10, 2026', icon: { type: 'ng-icon', name: 'lucideBox' }, color: 'info' },
    {
      title: 'Payment confirmed',
      date: 'Jan 10, 2026',
      icon: { type: 'ng-icon', name: 'lucideCreditCard' },
      color: 'help',
    },
    { title: 'Shipped', date: 'Jan 12, 2026', icon: { type: 'ng-icon', name: 'lucideTruck' }, color: 'warn' },
    {
      title: 'Delivered',
      date: 'Jan 15, 2026',
      icon: { type: 'ng-icon', name: 'lucidePackageCheck' },
      color: 'success',
    },
  ];

  protected readonly horizontalItems: TimelineItem[] = [
    { title: 'Placed', icon: { type: 'ng-icon', name: 'lucideBox' } },
    { title: 'Paid', icon: { type: 'ng-icon', name: 'lucideCreditCard' } },
    { title: 'Shipped', icon: { type: 'ng-icon', name: 'lucideTruck' } },
    { title: 'Delivered', icon: { type: 'ng-icon', name: 'lucideCheck' }, color: 'success' },
  ];

  protected readonly basicCode = `protected items = [
  { title: 'Order placed', date: 'Jan 10, 2026', content: 'Your order was received and is awaiting payment.' },
  { title: 'Payment confirmed', date: 'Jan 10, 2026', content: 'Card charge succeeded.' },
  { title: 'Shipped', date: 'Jan 12, 2026', content: 'Package handed to the carrier.' },
  { title: 'Delivered', date: 'Jan 15, 2026', content: 'Left at the front door.' },
];

<s-timeline [items]="items" />`;

  protected readonly alternateCode = `<s-timeline [items]="items" align="alternate" />`;

  protected readonly coloredCode = `protected items = [
  { title: 'Order placed', icon: { type: 'ng-icon', name: 'lucideBox' }, color: 'info' },
  { title: 'Payment confirmed', icon: { type: 'ng-icon', name: 'lucideCreditCard' }, color: 'help' },
  { title: 'Shipped', icon: { type: 'ng-icon', name: 'lucideTruck' }, color: 'warn' },
  { title: 'Delivered', icon: { type: 'ng-icon', name: 'lucidePackageCheck' }, color: 'success' },
];

<s-timeline [items]="items" />`;

  protected readonly horizontalCode = `<s-timeline [items]="items" orientation="horizontal" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly TimelineItem[]',
      default: '[]',
      description:
        'The entries to render, in order. TimelineItem: { title?: string; content?: string; date?: string; icon?: IconRef; color?: Severity }.',
    },
    {
      name: 'orientation',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      description: 'Layout direction of the sequence.',
    },
    {
      name: 'align',
      type: "'left' | 'right' | 'alternate'",
      default: "'left'",
      description:
        "Vertical only: which side of the axis content renders on. 'alternate' flips per entry and moves the date to the opposite side.",
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-orientation', description: "The active orientation, set on the host." },
    { name: 'data-align', description: "The active align mode, vertical only -- unset in horizontal orientation." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-timeline', description: 'The grid container for the whole sequence.' },
    { name: '.s-timeline__axis', description: 'Wraps one entry\'s marker and connector.' },
    { name: '.s-timeline__marker', description: 'The dot/icon indicator.' },
    { name: '.s-timeline__connector', description: 'The line joining one entry to the next.' },
    { name: '.s-timeline__opposite', description: "The far column in align=\"alternate\" mode, holding the date on the side opposite content." },
    { name: '.s-timeline__content', description: "An entry's title/date/body block." },
    { name: '.s-timeline__date', description: 'The date text.' },
    { name: '.s-timeline__title', description: 'The title text.' },
    { name: '.s-timeline__body', description: 'The content paragraph.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-comp-stepper-*',
      description:
        'Reused directly -- a timeline is the same shape as a stepper (markers joined by a connector) without progress state, so it shares circle-size/connector-color/label-color/description-color/font-size rather than owning its own token set.',
    },
    {
      name: '--semiui-comp-button-variants-*-background',
      description: "Reused for an item's optional color, via --s-timeline-marker-bg.",
    },
  ];
}

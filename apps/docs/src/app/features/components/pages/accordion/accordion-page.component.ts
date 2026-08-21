import { Component } from '@angular/core';
import { AccordionComponent, AccordionItem } from '../../../../components/accordion/accordion.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface FaqItem extends AccordionItem {
  answer: string;
}

@Component({
  selector: 'app-accordion-page',
  imports: [
    AccordionComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './accordion-page.component.html',
  styleUrl: './accordion-page.component.css',
})
export class AccordionPageComponent {
  protected faqs: FaqItem[] = [
    {
      header: 'What is SemiUI?',
      answer: 'An Angular UI library with provider-based theming and copy-paste component ownership.',
    },
    { header: 'Is it free?', answer: 'Yes -- the CLI and every component are free and open source.' },
    {
      header: 'Can I customize the components?',
      answer: 'Since components are copied into your own project as source, you can edit them however you like.',
    },
  ];

  protected sections: AccordionItem[] = [
    { header: 'Section one' },
    { header: 'Section two' },
    { header: 'Disabled section', disabled: true },
  ];

  protected readonly basicUsageCode = `protected faqs = [
  { header: 'What is SemiUI?', answer: '...' },
  { header: 'Is it free?', answer: '...' },
];

<s-accordion [items]="faqs">
  <ng-template #content let-item>
    <p>{{ item.answer }}</p>
  </ng-template>
</s-accordion>`;

  protected readonly multipleCode = `<s-accordion [items]="sections" [multiple]="true" [defaultOpenIndices]="[0, 1]">
  <ng-template #content let-item>...</ng-template>
</s-accordion>`;

  protected readonly customHeaderCode = `<s-accordion [items]="faqs">
  <ng-template #header let-item let-i="index">
    <strong>Q{{ i + 1 }}.</strong> {{ item.header }}
  </ng-template>
  <ng-template #content let-item><p>{{ item.answer }}</p></ng-template>
</s-accordion>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly TItem[]',
      default: '[]',
      description: 'Array of items to render; each needs at least a header (extend AccordionItem for extra fields your templates need).',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'Allows more than one panel to stay open at once. By default only one panel is open at a time.',
    },
    {
      name: 'defaultOpenIndices',
      type: 'readonly number[]',
      default: '[]',
      description: 'Indices expanded on initial render.',
    },
    {
      name: 'header',
      type: 'string',
      description: "Per-item (AccordionItem): text shown in the header row, unless overridden by the #header template.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Per-item (AccordionItem): disables that panel -- its header becomes unclickable and dimmed.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-expanded', description: 'Present on .s-accordion__item while its panel is open.' },
    { name: 'data-disabled', description: 'Present on .s-accordion__item when that item is disabled.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-accordion', description: 'The bordered container wrapping all items.' },
    { name: '.s-accordion__item', description: 'Each row -- header plus its collapsible panel.' },
    { name: '.s-accordion__header', description: 'The clickable header button carrying background, color, and typography.' },
    { name: '.s-accordion__header-label', description: 'Wraps the header text or custom #header template.' },
    { name: '.s-accordion__chevron', description: 'The expand/collapse icon; rotates 180deg when its item is expanded.' },
    { name: '.s-accordion__panel', description: 'The grid-based wrapper driving the pure-CSS expand/collapse animation.' },
    { name: '.s-accordion__panel-content', description: 'Inner padding for the #content template output.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-accordion-border', description: 'Border color for the container and item separators.' },
    { name: '--semiui-comp-accordion-radius', description: 'Corner radius of the container.' },
    { name: '--semiui-comp-accordion-padding-x', description: 'Horizontal padding for headers and panel content.' },
    { name: '--semiui-comp-accordion-padding-y', description: 'Vertical padding for headers and panel content.' },
    { name: '--semiui-comp-accordion-header-background', description: 'Header background color.' },
    { name: '--semiui-comp-accordion-header-background-hover', description: 'Header background on hover (non-disabled).' },
    { name: '--semiui-comp-accordion-header-foreground', description: 'Header text color.' },
    { name: '--semiui-comp-accordion-font-size', description: 'Header font size.' },
    { name: '--semiui-comp-accordion-font-weight', description: 'Header font weight.' },
    { name: '--semiui-comp-accordion-panel-background', description: 'Panel content background color.' },
    { name: '--semiui-comp-accordion-panel-foreground', description: 'Panel content text color.' },
  ];
}

import { Component } from '@angular/core';
import { AccordionComponent, AccordionItem } from '../../../../components/accordion/accordion.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

interface FaqItem extends AccordionItem {
  answer: string;
}

@Component({
  selector: 'app-accordion-page',
  imports: [AccordionComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
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
}

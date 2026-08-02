import { Component } from '@angular/core';
import { AccordionComponent, AccordionItem } from '../../accordion/accordion.component';

interface FaqItem extends AccordionItem {
  answer: string;
}

@Component({
  selector: 'app-accordion-docs-page',
  imports: [AccordionComponent],
  templateUrl: './accordion-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class AccordionDocsPage {
  protected faqs: FaqItem[] = [
    { header: 'What is Zaytoon?', answer: 'An Angular UI library with provider-based theming and copy-paste component ownership.' },
    { header: 'Is it free?', answer: 'Yes -- the CLI and every component are free and open source.' },
    { header: 'Can I customize the components?', answer: 'Since components are copied into your own project as source, you can edit them however you like.', disabled: false },
  ];

  protected sections: AccordionItem[] = [
    { header: 'Section one' },
    { header: 'Section two' },
    { header: 'Disabled section', disabled: true },
  ];
}

import { Component, signal } from '@angular/core';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-pagination-page',
  imports: [
    PaginationComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './pagination-page.component.html',
  styleUrl: './pagination-page.component.css',
})
export class PaginationPageComponent {
  protected page = signal(1);
  protected bigPage = signal(7);

  protected readonly basicCode = `<s-pagination [(page)]="page" [pageCount]="5" />`;

  protected readonly ellipsisCode = `<s-pagination [(page)]="page" [pageCount]="50" [siblingCount]="1" />`;

  protected readonly noFirstLastCode = `<s-pagination [showFirstLast]="false" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'page',
      type: 'number',
      default: '1',
      description: '1-indexed current page. Two-way bindable via [(page)].',
    },
    {
      name: 'pageCount',
      type: 'number',
      default: '1',
      description: 'Total number of pages.',
    },
    {
      name: 'siblingCount',
      type: 'number',
      default: '1',
      description: 'How many page numbers to show on each side of the current page before collapsing to an ellipsis.',
    },
    {
      name: 'showFirstLast',
      type: 'boolean',
      default: 'true',
      description: 'Shows the jump-to-first and jump-to-last buttons.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-pagination', description: 'The nav element wrapping all buttons.' },
    { name: '.s-pagination__button', description: 'Every button: prev/next, first/last, and page numbers.' },
    { name: '.s-pagination__button--page[aria-current=\'page\']', description: 'The active page-number button.' },
    { name: '.s-pagination__ellipsis', description: 'The collapsed-range marker between page numbers.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-pagination-gap', description: 'Spacing between buttons.' },
    { name: '--semiui-comp-pagination-size', description: 'Button min-width/height (square footprint).' },
    { name: '--semiui-comp-pagination-radius', description: 'Button corner radius.' },
    { name: '--semiui-comp-pagination-border', description: 'Button border color.' },
    { name: '--semiui-comp-pagination-background / -foreground', description: 'Default button colors.' },
    { name: '--semiui-comp-pagination-background-hover', description: 'Button background on hover.' },
    { name: '--semiui-comp-pagination-foreground-disabled', description: 'Text color for disabled buttons and the ellipsis.' },
    { name: '--semiui-comp-pagination-background-active / -foreground-active', description: 'Colors for the active page-number button.' },
  ];
}

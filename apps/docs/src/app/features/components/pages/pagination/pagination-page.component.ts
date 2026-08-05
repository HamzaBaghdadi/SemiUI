import { Component, signal } from '@angular/core';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-pagination-page',
  imports: [PaginationComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
  templateUrl: './pagination-page.component.html',
  styleUrl: './pagination-page.component.css',
})
export class PaginationPageComponent {
  protected page = signal(1);
  protected bigPage = signal(7);

  protected readonly basicCode = `<s-pagination [(page)]="page" [pageCount]="5" />`;

  protected readonly ellipsisCode = `<s-pagination [(page)]="page" [pageCount]="50" [siblingCount]="1" />`;

  protected readonly noFirstLastCode = `<s-pagination [showFirstLast]="false" />`;
}

import { Component, signal } from '@angular/core';
import { PaginationComponent } from '../../pagination/pagination.component';

@Component({
  selector: 'app-pagination-docs-page',
  imports: [PaginationComponent],
  templateUrl: './pagination-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class PaginationDocsPage {
  protected page = signal(1);
  protected bigPage = signal(7);
}

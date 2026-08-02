import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-breadcrumb-docs-page',
  imports: [BreadcrumbComponent],
  templateUrl: './breadcrumb-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class BreadcrumbDocsPage {
  protected items = [
    { label: 'Home', link: '/' },
    { label: 'Components', link: '/components/breadcrumb' },
    { label: 'Breadcrumb' },
  ];
}

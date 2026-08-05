import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../../components/breadcrumb/breadcrumb.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-breadcrumb-page',
  imports: [BreadcrumbComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
  templateUrl: './breadcrumb-page.component.html',
  styleUrl: './breadcrumb-page.component.css',
})
export class BreadcrumbPageComponent {
  protected items = [
    { label: 'Home', link: '/home' },
    { label: 'Components', link: '/components/breadcrumb' },
    { label: 'Breadcrumb' },
  ];

  protected readonly usageCode = `protected items = [
  { label: 'Home', link: '/home' },
  { label: 'Components', link: '/components/breadcrumb' },  // styled current when the router URL matches, not because it's "last"
  { label: 'Breadcrumb' },  // no link -- always plain, non-navigable text
];

<s-breadcrumb [items]="items" />`;
}

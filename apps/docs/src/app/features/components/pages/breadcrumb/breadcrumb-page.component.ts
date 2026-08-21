import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideFolder, lucideHouse } from '@ng-icons/lucide';
import { IconRef } from '@semiui/tokens';
import { BreadcrumbComponent } from '../../../../components/breadcrumb/breadcrumb.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-breadcrumb-page',
  imports: [
    BreadcrumbComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './breadcrumb-page.component.html',
  styleUrl: './breadcrumb-page.component.css',
  providers: [provideIcons({ lucideHouse, lucideFolder })],
})
export class BreadcrumbPageComponent {
  protected items = [
    { label: 'Home', link: '/home' },
    { label: 'Components', link: '/components/breadcrumb' },
    { label: 'Breadcrumb' },
  ];

  protected readonly homeIcon: IconRef = { type: 'ng-icon', name: 'lucideHouse' };
  protected readonly folderIcon: IconRef = { type: 'ng-icon', name: 'lucideFolder' };

  protected readonly itemsWithIcons = [
    { label: 'Home', link: '/home', icon: this.homeIcon },
    { label: 'Components', link: '/components/breadcrumb', icon: this.folderIcon },
    { label: 'Breadcrumb' },
  ];

  protected readonly usageCode = `protected items = [
  { label: 'Home', link: '/home' },
  { label: 'Components', link: '/components/breadcrumb' },  // styled current when the router URL matches, not because it's "last"
  { label: 'Breadcrumb' },  // no link -- always plain, non-navigable text
];

<s-breadcrumb [items]="items" />`;

  protected readonly iconsCode = `protected items = [
  { label: 'Home', link: '/home', icon: homeIcon },
  { label: 'Components', link: '/components/breadcrumb', icon: folderIcon },
  { label: 'Breadcrumb' },  // no icon -- purely optional per item
];

<s-breadcrumb [items]="items" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly BreadcrumbItem[]',
      default: '[]',
      description: 'The trail of crumbs to render, in order.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Per-item (BreadcrumbItem): text shown for that crumb.',
    },
    {
      name: 'link',
      type: 'string | unknown[]',
      description: "Per-item (BreadcrumbItem): omit for a non-navigable segment (plain text). With a link, the item renders as a real anchor; \"current page\" styling comes from routerLinkActive matching the actual route, not from being the last item.",
    },
    {
      name: 'icon',
      type: 'IconRef',
      description: 'Per-item (BreadcrumbItem): optional leading icon, rendered before the label.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-breadcrumb', description: 'The <ol> trail container.' },
    { name: '.s-breadcrumb__item', description: 'Each <li> -- a crumb plus its trailing separator.' },
    { name: '.s-breadcrumb__link', description: 'A navigable crumb\'s anchor.' },
    { name: '.s-breadcrumb__link--current', description: 'Applied (via routerLinkActive) to a linked crumb whose route matches the current URL -- still a real, clickable anchor, just styled as "you are here".' },
    { name: '.s-breadcrumb__current', description: 'A non-navigable crumb (no link) rendered as plain, styled text.' },
    { name: '.s-breadcrumb__separator', description: 'The chevron between crumbs; flips under RTL.' },
    { name: '.s-breadcrumb__icon', description: "A crumb's optional leading icon." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-breadcrumb-gap', description: 'Spacing between crumbs and between a crumb and its icon/separator.' },
    { name: '--semiui-comp-breadcrumb-font-size', description: 'Font size of the trail.' },
    { name: '--semiui-comp-breadcrumb-foreground', description: 'Text color of non-current links.' },
    { name: '--semiui-comp-breadcrumb-current-foreground', description: 'Text color of the current-page crumb and link hover state.' },
    { name: '--semiui-comp-breadcrumb-separator-color', description: 'Color of the chevron separators.' },
  ];
}

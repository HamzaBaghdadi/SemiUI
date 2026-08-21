import { Component } from '@angular/core';
import { SkeletonComponent } from '../../../../components/skeleton/skeleton.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-skeleton-page',
  imports: [
    SkeletonComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './skeleton-page.component.html',
  styleUrl: './skeleton-page.component.css',
})
export class SkeletonPageComponent {
  protected readonly shapesCode = `<s-skeleton height="1.25rem" width="60%" />
<s-skeleton shape="circle" width="3rem" height="3rem" />
<s-skeleton shape="text" [lines]="3" />`;

  protected readonly noAnimationCode = `<s-skeleton [animated]="false" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'shape',
      type: "'rect' | 'circle' | 'text'",
      default: "'rect'",
      description: "Block shape. 'text' renders lines instead of a single block, with the last line shorter, like real paragraph text.",
    },
    {
      name: 'width',
      type: 'string',
      default: "'100%'",
      description: 'CSS width of the block (or each line, when shape is text).',
    },
    {
      name: 'height',
      type: 'string',
      default: "'1rem'",
      description: 'CSS height of the block (or each line, when shape is text).',
    },
    {
      name: 'lines',
      type: 'number',
      default: '3',
      description: 'Number of lines rendered when shape="text".',
    },
    {
      name: 'animated',
      type: 'boolean',
      default: 'true',
      description: 'Whether the shimmer animation plays.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-shape', description: "The active shape, e.g. [data-shape='circle'] -- rounds the block into a circle." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-skeleton__lines', description: 'Wraps the stacked line blocks when shape="text".' },
    { name: '.s-skeleton__block', description: 'Each placeholder block (or line).' },
    { name: '.s-skeleton__block--animated', description: 'Applied when animated is set -- adds the shimmer sweep.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-skeleton-background', description: 'Block base color.' },
    { name: '--semiui-comp-skeleton-radius', description: 'Block corner radius (ignored for shape="circle", which is always fully round).' },
    { name: '--semiui-comp-skeleton-shimmer', description: 'Color of the animated shimmer sweep.' },
  ];
}

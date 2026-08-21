import { Component, signal } from '@angular/core';
import {
  OrgChartNode,
  OrganizationChartComponent,
} from '../../../../components/organization-chart/organization-chart.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface PersonRow {
  label: string;
  title?: string;
}

@Component({
  selector: 'app-organization-chart-page',
  imports: [
    OrganizationChartComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './organization-chart-page.component.html',
  styleUrl: './organization-chart-page.component.css',
})
export class OrganizationChartPageComponent {
  protected readonly root: OrgChartNode<PersonRow> = {
    data: { label: 'Amara Osei', title: 'CEO' },
    children: [
      {
        data: { label: 'Diego Fuentes', title: 'VP Engineering' },
        children: [
          { data: { label: 'Priya Nair', title: 'Eng Manager' } },
          { data: { label: 'Tom Reyes', title: 'Eng Manager' } },
        ],
      },
      {
        data: { label: 'Sofia Marchetti', title: 'VP Sales' },
        children: [{ data: { label: 'Noah Bergström', title: 'Sales Manager' } }],
      },
      { data: { label: 'Liu Wei', title: 'VP Finance' } },
    ],
  };

  protected readonly selection = signal<OrgChartNode<PersonRow>[]>([]);

  protected readonly basicCode = `protected root = {
  data: { label: 'Amara Osei', title: 'CEO' },
  children: [
    {
      data: { label: 'Diego Fuentes', title: 'VP Engineering' },
      children: [
        { data: { label: 'Priya Nair', title: 'Eng Manager' } },
        { data: { label: 'Tom Reyes', title: 'Eng Manager' } },
      ],
    },
    { data: { label: 'Sofia Marchetti', title: 'VP Sales' } },
  ],
};

<s-organization-chart [node]="root" />`;

  protected readonly selectionCode = `<s-organization-chart [node]="root" selectionMode="single" [(selection)]="selection" />`;

  protected readonly noCollapseCode = `<s-organization-chart [node]="root" [collapsible]="false" />`;

  protected readonly nodeTemplateCode = `<s-organization-chart [node]="root">
  <ng-template #node let-person let-node="node">
    <div class="flex flex-col items-center">
      <span class="font-semibold">{{ person.label }}</span>
      @if (person.title) {
        <span class="text-xs text-muted-foreground">{{ person.title }}</span>
      }
    </div>
  </ng-template>
</s-organization-chart>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'node',
      type: 'OrgChartNode<T>',
      default: 'required',
      description: 'The root node. OrgChartNode: { data: T; children?: OrgChartNode<T>[]; expanded?: boolean }.',
    },
    {
      name: 'collapsible',
      type: 'boolean',
      default: 'true',
      description: 'Whether any node shows an expand/collapse toggle. Set false for a tree that always renders fully expanded with no toggle anywhere.',
    },
    {
      name: 'selectionMode',
      type: "'none' | 'single' | 'multiple'",
      default: "'none'",
      description: 'Whether clicking (or Enter/Space on) a node box selects it.',
    },
    {
      name: 'selection',
      type: 'OrgChartNode<T>[]',
      default: '[]',
      description: 'The currently selected nodes. Two-way bindable.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-organization-chart', description: 'The scrollable outer wrapper.' },
    { name: '.s-organization-chart-node', description: "One node's own host element -- present once per node in the tree, including the root." },
    { name: '.s-organization-chart-node__box', description: "A node's card -- carries [data-selected] when selected." },
    { name: '.s-organization-chart-node__label', description: 'Default label text, shown when no #node template is projected.' },
    { name: '.s-organization-chart-node__toggle', description: "A node's expand/collapse button, shown when it has children." },
    { name: '.s-organization-chart-node__toggle-icon', description: 'The chevron inside the toggle button -- rotates on collapse.' },
    { name: '.s-organization-chart-node__children', description: "A node's row of child nodes, plus the connector lines down to them." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-comp-popover-*',
      description: "Reused directly for a node box's background/border/radius/shadow -- a node card is genuinely a popover-style surface.",
    },
    { name: '--semiui-comp-organization-chart-node-min-width', description: "A node box's minimum width." },
    { name: '--semiui-comp-organization-chart-node-background-selected', description: 'Background of a selected node.' },
    { name: '--semiui-comp-organization-chart-node-border-selected', description: 'Border color of a selected node.' },
    { name: '--semiui-comp-organization-chart-toggle-size', description: "The expand/collapse toggle button's diameter." },
    { name: '--semiui-comp-organization-chart-gap', description: 'Vertical connector length between a node and its children, and the horizontal gap between sibling subtrees.' },
  ];
}

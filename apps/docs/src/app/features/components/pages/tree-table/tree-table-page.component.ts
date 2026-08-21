import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideFile, lucideFolder } from '@ng-icons/lucide';
import { SIconComponent } from '@semiui/primitives/icon';
import { IconRef } from '@semiui/tokens';
import {
  TreeNode,
  TreeTableColumn,
  TreeTableComponent,
} from '../../../../components/tree-table/tree-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface FileRow {
  name: string;
  type: 'folder' | 'file';
  size?: string;
}

@Component({
  selector: 'app-tree-table-page',
  imports: [
    TreeTableComponent,
    SIconComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './tree-table-page.component.html',
  styleUrl: './tree-table-page.component.css',
  providers: [provideIcons({ lucideFolder, lucideFile })],
})
export class TreeTablePageComponent {
  protected readonly columns: TreeTableColumn<FileRow>[] = [
    { field: 'name', header: 'Name' },
    { field: 'type', header: 'Type', width: '8rem' },
    { field: 'size', header: 'Size', width: '8rem', align: 'end' },
  ];

  protected readonly nodes: TreeNode<FileRow>[] = [
    {
      data: { name: 'src', type: 'folder' },
      expanded: true,
      children: [
        {
          data: { name: 'app', type: 'folder' },
          expanded: true,
          children: [
            { data: { name: 'app.component.ts', type: 'file', size: '2.1 KB' } },
            { data: { name: 'app.routes.ts', type: 'file', size: '1.4 KB' } },
          ],
        },
        { data: { name: 'main.ts', type: 'file', size: '0.3 KB' } },
      ],
    },
    {
      data: { name: 'public', type: 'folder' },
      children: [{ data: { name: 'favicon.ico', type: 'file', size: '4.2 KB' } }],
    },
    { data: { name: 'package.json', type: 'file', size: '1.8 KB' } },
  ];

  protected readonly selection = signal<TreeNode<FileRow>[]>([]);

  protected readonly folderIcon: IconRef = { type: 'ng-icon', name: 'lucideFolder' };
  protected readonly fileIcon: IconRef = { type: 'ng-icon', name: 'lucideFile' };

  protected readonly basicCode = `protected columns = [
  { field: 'name', header: 'Name' },
  { field: 'type', header: 'Type', width: '8rem' },
  { field: 'size', header: 'Size', width: '8rem', align: 'end' },
];

protected nodes = [
  {
    data: { name: 'src', type: 'folder' },
    expanded: true,
    children: [
      { data: { name: 'app.component.ts', type: 'file', size: '2.1 KB' } },
      { data: { name: 'main.ts', type: 'file', size: '0.3 KB' } },
    ],
  },
  { data: { name: 'package.json', type: 'file', size: '1.8 KB' } },
];

<s-tree-table [columns]="columns" [nodes]="nodes" />`;

  protected readonly selectionCode = `<s-tree-table [columns]="columns" [nodes]="nodes" selectionMode="multiple" [(selection)]="selection" />`;

  protected readonly cellTemplateCode = `<s-tree-table [columns]="columns" [nodes]="nodes">
  <ng-template #cell let-value let-node="node" let-column="column">
    @if (column.field === 'name') {
      <s-icon [ref]="node.data.type === 'folder' ? folderIcon : fileIcon" />
      {{ value }}
    } @else {
      {{ value }}
    }
  </ng-template>
</s-tree-table>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'columns',
      type: 'readonly TreeTableColumn<T>[]',
      default: '[]',
      description: 'Column definitions: { field: string; header: string; width?: string; align?: "left"|"center"|"right"|"start"|"end" }.',
    },
    {
      name: 'nodes',
      type: 'readonly TreeNode<T>[]',
      default: '[]',
      description: 'The root-level nodes. TreeNode: { data: T; children?: TreeNode<T>[]; expanded?: boolean }.',
    },
    {
      name: 'selectionMode',
      type: "'none' | 'single' | 'multiple'",
      default: "'none'",
      description: 'Row selection mode -- adds a leading checkbox (multiple) or radio (single) column.',
    },
    {
      name: 'selection',
      type: 'TreeNode<T>[]',
      default: '[]',
      description: 'The currently selected nodes. Two-way bindable.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows a loading row in place of the data.',
    },
    {
      name: 'striped',
      type: 'boolean',
      default: 'true',
      description: 'Alternates row background color.',
    },
    {
      name: 'emptyMessage',
      type: 'string',
      default: "'No data available'",
      description: 'Shown when nodes is empty.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-tree-table', description: 'The <table> element itself.' },
    { name: '.s-tree-table__th', description: 'A header cell.' },
    { name: '.s-tree-table__tr', description: 'A data row.' },
    { name: '.s-tree-table__td', description: 'A data cell.' },
    { name: '.s-tree-table__indent', description: "A row's depth-based spacer in the first column." },
    { name: '.s-tree-table__toggle', description: 'The expand/collapse button, shown when a node has children.' },
    { name: '.s-tree-table__toggle-icon', description: 'The chevron inside the toggle button -- rotates on expand.' },
    { name: '.s-tree-table__toggle-spacer', description: "A leaf row's placeholder, keeping its text aligned under sibling rows' text." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-comp-table-*',
      description: 'Reused directly from Table -- border, radius, header/row colors, cell padding, font size all match a plain Table.',
    },
    {
      name: '--semiui-comp-radio-*',
      description: "Reused for the single-selection column's radio dot, same as Table's own.",
    },
  ];
}

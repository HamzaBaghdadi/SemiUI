import { Component } from '@angular/core';
import {
  SplitterComponent,
  SplitterPanelDirective,
} from '../../../../components/splitter/splitter.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-splitter-page',
  imports: [
    SplitterComponent,
    SplitterPanelDirective,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './splitter-page.component.html',
  styleUrl: './splitter-page.component.css',
})
export class SplitterPageComponent {
  protected readonly basicCode = `<s-splitter style="height: 16rem">
  <ng-template sSplitterPanel [size]="30" [minSize]="15">
    <div class="p-4">Sidebar</div>
  </ng-template>
  <ng-template sSplitterPanel [size]="70" [minSize]="30">
    <div class="p-4">Main content</div>
  </ng-template>
</s-splitter>`;

  protected readonly threePanelCode = `<s-splitter style="height: 16rem">
  <ng-template sSplitterPanel [size]="20" [minSize]="10">
    <div class="p-4">Left</div>
  </ng-template>
  <ng-template sSplitterPanel [size]="50" [minSize]="20">
    <div class="p-4">Center</div>
  </ng-template>
  <ng-template sSplitterPanel [size]="30" [minSize]="10">
    <div class="p-4">Right</div>
  </ng-template>
</s-splitter>`;

  protected readonly verticalCode = `<s-splitter orientation="vertical" style="height: 20rem">
  <ng-template sSplitterPanel [size]="40" [minSize]="15">
    <div class="p-4">Top</div>
  </ng-template>
  <ng-template sSplitterPanel [size]="60" [minSize]="15">
    <div class="p-4">Bottom</div>
  </ng-template>
</s-splitter>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Layout direction of the panels.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly panelApiProps: ApiPropRow[] = [
    {
      name: 'size',
      type: 'number',
      default: 'undefined',
      description:
        'Initial size, as a percentage of the main axis. Panels that omit it split whatever percentage remains evenly among themselves.',
    },
    {
      name: 'minSize',
      type: 'number',
      default: '0',
      description: "Minimum size, as a percentage -- dragging (or arrow-keying) an adjacent gutter won't shrink this panel past it.",
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-orientation', description: 'The active orientation, set on the host.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-splitter__panel', description: 'A single panel, sized via flex-grow.' },
    { name: '.s-splitter__gutter', description: 'The draggable divider between two panels.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-color-border', description: "The gutter's resting color, and the splitter's own outer border." },
    { name: '--semiui-color-primary', description: "The gutter's hover/focus color." },
    { name: '--semiui-radius-md', description: "The splitter's outer corner radius." },
  ];
}

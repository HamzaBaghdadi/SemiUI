import { Component } from '@angular/core';
import { ChartComponent, ChartSeries } from '../../../../components/chart/chart.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-chart-page',
  imports: [
    ChartComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './chart-page.component.html',
  styleUrl: './chart-page.component.css',
})
export class ChartPageComponent {
  protected months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  protected revenueSeries: ChartSeries[] = [{ name: 'Revenue', values: [4200, 5100, 4800, 6300, 7100, 6800] }];

  protected multiSeries: ChartSeries[] = [
    { name: '2025', values: [3200, 4100, 3800, 5300, 5900, 5600] },
    { name: '2026', values: [4200, 5100, 4800, 6300, 7100, 6800] },
  ];

  protected browserLabels = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'];
  protected browserSeries: ChartSeries[] = [{ name: 'Share', values: [64, 18, 8, 6, 4] }];

  protected currencyFormatter = (value: number): string => `$${(value / 1000).toFixed(1)}k`;

  protected scatterSeries: ChartSeries[] = [
    { name: 'Response time (ms)', values: [120, 340, 90, 410, 200, 60] },
  ];

  protected radarLabels = ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency', 'Price'];
  protected radarSeries: ChartSeries[] = [
    { name: 'Model A', values: [80, 90, 70, 85, 60, 75] },
    { name: 'Model B', values: [65, 70, 90, 75, 85, 60] },
  ];

  protected stackedBarSeries: ChartSeries[] = [
    { name: 'Product', values: [1200, 1500, 1400, 1800, 2000, 1900] },
    { name: 'Services', values: [600, 700, 650, 800, 900, 950] },
  ];

  protected netIncomeSeries: ChartSeries[] = [{ name: 'Net income', values: [1200, 800, -400, -900, 300, 1500] }];

  protected readonly scatterCode = `protected series = [{ name: 'Response time (ms)', values: [120, 340, 90, 410, 200, 60] }];

<s-chart type="scatter" [labels]="labels" [series]="series" />`;

  protected readonly radarCode = `protected labels = ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency', 'Price'];
protected series = [
  { name: 'Model A', values: [80, 90, 70, 85, 60, 75] },
  { name: 'Model B', values: [65, 70, 90, 75, 85, 60] },
];

<s-chart type="radar" [labels]="labels" [series]="series" />`;

  protected readonly stackedBarCode = `protected series = [
  { name: 'Product', values: [1200, 1500, 1400, 1800, 2000, 1900] },
  { name: 'Services', values: [600, 700, 650, 800, 900, 950] },
];

<s-chart type="bar" [stacked]="true" [labels]="labels" [series]="series" />`;

  protected readonly stackedAreaCode = `<s-chart type="area" [stacked]="true" [labels]="labels" [series]="series" />`;

  protected readonly negativeCode = `protected series = [{ name: 'Net income', values: [1200, 800, -400, -900, 300, 1500] }];

<s-chart type="bar" [labels]="labels" [series]="series" />`;

  protected readonly lineCode = `protected labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
protected series = [{ name: 'Revenue', values: [4200, 5100, 4800, 6300, 7100, 6800] }];

<s-chart type="line" [labels]="labels" [series]="series" />`;

  protected readonly multiSeriesCode = `protected series = [
  { name: '2025', values: [3200, 4100, 3800, 5300, 5900, 5600] },
  { name: '2026', values: [4200, 5100, 4800, 6300, 7100, 6800] },
];

<s-chart type="line" [labels]="labels" [series]="series" />`;

  protected readonly barCode = `<s-chart type="bar" [labels]="labels" [series]="series" />`;
  protected readonly areaCode = `<s-chart type="area" [labels]="labels" [series]="series" />`;

  protected readonly pieCode = `protected labels = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'];
protected series = [{ name: 'Share', values: [64, 18, 8, 6, 4] }];

<s-chart type="pie" [labels]="labels" [series]="series" />`;

  protected readonly donutCode = `<s-chart type="donut" [labels]="labels" [series]="series" />`;

  protected readonly noChromeCode = `<s-chart type="bar" [labels]="labels" [series]="series" [showGrid]="false" [showLegend]="false" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'type',
      type: "'line' | 'bar' | 'area' | 'scatter' | 'radar' | 'pie' | 'donut'",
      default: "'line'",
      description: 'Chart kind. Cartesian types (line/bar/area/scatter) share one axis/gridline/tooltip system, including a value domain that extends below zero when any value is negative; pie/donut share arc math; radar reuses the same polar math around a fixed circle, one spoke per label.',
    },
    {
      name: 'stacked',
      type: 'boolean',
      default: 'false',
      description: 'Stacks each label\'s series cumulatively -- vertically for bar, layered for area -- instead of side-by-side / sharing the zero baseline. Only applies to type="bar" / type="area".',
    },
    {
      name: 'labels',
      type: 'readonly string[]',
      default: '[]',
      description: 'Axis category labels (cartesian types) or slice labels (pie/donut), one per data point.',
    },
    {
      name: 'series',
      type: 'readonly ChartSeries[]',
      default: '[]',
      description: 'The data to plot. Pie/donut use only series[0].',
    },
    {
      name: 'name',
      type: 'string',
      description: 'Per-series (ChartSeries): shown in the legend and tooltip.',
    },
    {
      name: 'values',
      type: 'readonly number[]',
      description: 'Per-series (ChartSeries): one value per label.',
    },
    {
      name: 'color',
      type: 'string',
      description: 'Per-series (ChartSeries): explicit color, overriding the colors palette cycling.',
    },
    {
      name: 'height',
      type: 'number',
      default: '320',
      description: 'Chart height in pixels. Width is always 100% of the container.',
    },
    {
      name: 'showLegend',
      type: 'boolean',
      default: 'true',
      description: 'Shows the legend below the chart. Clicking an entry toggles that series\' visibility.',
    },
    {
      name: 'showGrid',
      type: 'boolean',
      default: 'true',
      description: 'Shows gridlines and axis labels (cartesian types only).',
    },
    {
      name: 'valueFormatter',
      type: '(value: number) => string',
      default: '(value) => String(value)',
      description: 'Formats axis tick labels and tooltip values.',
    },
    {
      name: 'colors',
      type: 'readonly string[]',
      default: 'DEFAULT_COLORS (8-color palette)',
      description: 'Palette cycled by index for any series/slice without an explicit color.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-chart__svg', description: 'The SVG root; responsive via viewBox + preserveAspectRatio.' },
    { name: '.s-chart__gridline', description: 'Horizontal gridlines (cartesian types).' },
    { name: '.s-chart__axis-label', description: 'Axis tick text (value and category labels).' },
    { name: '.s-chart__line', description: 'The stroked path for a line/area series.' },
    { name: '.s-chart__area', description: 'The filled path under a line for area charts.' },
    { name: '.s-chart__point', description: 'Each data-point circle on a line/area series; grows on hover.' },
    { name: '.s-chart__bar', description: 'Each bar in a bar chart; dims on hover.' },
    { name: '.s-chart__slice', description: 'Each wedge in a pie/donut chart; dims on hover.' },
    { name: '.s-chart__radar-ring', description: 'Each concentric grid ring in a radar chart.' },
    { name: '.s-chart__radar-spoke', description: 'Each axis line from center to edge in a radar chart.' },
    { name: '.s-chart__radar-area', description: 'Each series\' filled polygon in a radar chart.' },
    { name: '.s-chart__tooltip', description: 'The floating tooltip shown on hover.' },
    { name: '.s-chart__legend', description: 'The legend row below the chart.' },
    { name: '.s-chart__legend-item', description: 'Each legend entry (swatch + name).' },
    { name: '.s-chart__legend-item--button', description: 'Applied to cartesian legend entries -- clickable to toggle series visibility (pie/donut legend entries are static).' },
    { name: '.s-chart__legend-item--hidden', description: 'Applied to a legend entry whose series has been toggled off.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-chart-grid-color', description: 'Gridline stroke color.' },
    { name: '--semiui-comp-chart-axis-label-color', description: 'Axis tick text color.' },
    { name: '--semiui-comp-chart-axis-label-font-size', description: 'Axis tick text size.' },
    { name: '--semiui-comp-chart-line-stroke-width', description: 'Line series stroke width.' },
    { name: '--semiui-comp-chart-area-opacity', description: 'Fill opacity for area series.' },
    { name: '--semiui-comp-chart-tooltip-radius', description: 'Tooltip corner radius.' },
    { name: '--semiui-comp-chart-tooltip-background', description: 'Tooltip background color.' },
    { name: '--semiui-comp-chart-tooltip-foreground', description: 'Tooltip text color.' },
    { name: '--semiui-comp-chart-legend-gap', description: 'Spacing between legend entries.' },
    { name: '--semiui-comp-chart-legend-font-size', description: 'Legend text size.' },
  ];
}

import { Component } from '@angular/core';
import { ChartComponent, ChartSeries } from '../../../../components/chart/chart.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-chart-page',
  imports: [ChartComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
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
}

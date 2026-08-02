import { Component } from '@angular/core';
import { ChartComponent, ChartSeries } from '../../chart/chart.component';

@Component({
  selector: 'app-chart-docs-page',
  imports: [ChartComponent],
  templateUrl: './chart-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class ChartDocsPage {
  protected months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  protected revenueSeries: ChartSeries[] = [
    { name: 'Revenue', values: [4200, 5100, 4800, 6300, 7100, 6800] },
  ];

  protected multiSeries: ChartSeries[] = [
    { name: '2025', values: [3200, 4100, 3800, 5300, 5900, 5600] },
    { name: '2026', values: [4200, 5100, 4800, 6300, 7100, 6800] },
  ];

  protected browserLabels = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'];
  protected browserSeries: ChartSeries[] = [{ name: 'Share', values: [64, 18, 8, 6, 4] }];

  protected currencyFormatter = (value: number): string => `$${(value / 1000).toFixed(1)}k`;
}

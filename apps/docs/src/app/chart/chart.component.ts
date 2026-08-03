import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { Point, areaPath, buildTicks, linePath, niceMax, slicePath } from './chart-math';

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut';

export interface ChartSeries {
  name: string;
  values: readonly number[];
  color?: string;
}

interface HoverInfo {
  label: string;
  seriesName: string;
  value: string;
  color: string;
  x: number;
  y: number;
}

const DEFAULT_COLORS: readonly string[] = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 300;
const PADDING = { top: 16, right: 16, bottom: 32, left: 44 };
const TICK_COUNT = 4;

/**
 * An SVG chart supporting line, bar, area, pie, and donut via `type` -- no canvas, no external
 * charting library, so it themes and scales like any other component. Cartesian types (line/bar/
 * area) share one axis/gridline/tooltip system; pie/donut share arc math (donut is a pie with a
 * positive `innerRadius` fraction). The legend is clickable, toggling a series' visibility without
 * needing to re-pass `series` from the consumer.
 */
@Component({
  selector: 's-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent {
  type = input<ChartType>('line');
  labels = input<readonly string[]>([]);
  series = input<readonly ChartSeries[]>([]);
  height = input(320);
  showLegend = input(true, { transform: booleanAttribute });
  showGrid = input(true, { transform: booleanAttribute });
  valueFormatter = input<(value: number) => string>((value) => String(value));
  colors = input<readonly string[]>(DEFAULT_COLORS);

  protected readonly viewWidth = VIEW_WIDTH;
  protected readonly viewHeight = VIEW_HEIGHT;
  protected readonly hiddenSeries = signal<ReadonlySet<string>>(new Set());
  protected readonly hover = signal<HoverInfo | null>(null);

  protected readonly visibleSeries = computed(() => this.series().filter((s) => !this.hiddenSeries().has(s.name)));

  protected seriesColor(series: ChartSeries, index: number): string {
    return series.color ?? this.colors()[index % this.colors().length];
  }

  protected toggleSeries(name: string): void {
    this.hiddenSeries.update((current) => {
      const next = new Set(current);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  // ---- Cartesian (line / bar / area) ----

  private readonly plotArea = computed(() => ({
    x0: PADDING.left,
    x1: VIEW_WIDTH - PADDING.right,
    y0: PADDING.top,
    y1: VIEW_HEIGHT - PADDING.bottom,
    width: VIEW_WIDTH - PADDING.left - PADDING.right,
    height: VIEW_HEIGHT - PADDING.top - PADDING.bottom,
  }));

  protected readonly maxValue = computed(() => {
    const all = this.visibleSeries().flatMap((s) => s.values);
    return niceMax(all.length > 0 ? Math.max(...all, 0) : 1);
  });

  protected readonly ticks = computed(() => buildTicks(this.maxValue(), TICK_COUNT).reverse());

  protected readonly gridLines = computed(() => {
    const area = this.plotArea();
    return buildTicks(this.maxValue(), TICK_COUNT).map((value) => {
      const fraction = this.maxValue() === 0 ? 0 : value / this.maxValue();
      return area.y1 - fraction * area.height;
    });
  });

  private xPosition(index: number): number {
    const area = this.plotArea();
    const count = this.labels().length;
    if (count <= 1) {
      return area.x0 + area.width / 2;
    }
    return area.x0 + (index / (count - 1)) * area.width;
  }

  private yPosition(value: number): number {
    const area = this.plotArea();
    const max = this.maxValue();
    const fraction = max === 0 ? 0 : value / max;
    return area.y1 - fraction * area.height;
  }

  protected readonly labelPositions = computed(() => this.labels().map((label, i) => ({ label, x: this.xPosition(i) })));

  protected seriesPoints(series: ChartSeries): Point[] {
    return series.values.map((value, i) => ({ x: this.xPosition(i), y: this.yPosition(value) }));
  }

  protected linePathFor(series: ChartSeries): string {
    return linePath(this.seriesPoints(series));
  }

  protected areaPathFor(series: ChartSeries): string {
    return areaPath(this.seriesPoints(series), this.plotArea().y1);
  }

  protected readonly barGroups = computed(() => {
    const area = this.plotArea();
    const series = this.visibleSeries();
    const count = this.labels().length;
    if (count === 0 || series.length === 0) {
      return [];
    }
    const slotWidth = area.width / count;
    const groupPadding = slotWidth * 0.15;
    const barWidth = (slotWidth - groupPadding * 2) / series.length;
    return this.labels().map((label, labelIndex) => ({
      label,
      bars: series.map((s, seriesIndex) => {
        const value = s.values[labelIndex] ?? 0;
        const barHeight = area.y1 - this.yPosition(value);
        return {
          series: s,
          value,
          x: area.x0 + labelIndex * slotWidth + groupPadding + seriesIndex * barWidth,
          y: this.yPosition(value),
          width: barWidth,
          height: barHeight,
        };
      }),
    }));
  });

  protected showPointHover(event: MouseEvent, series: ChartSeries, seriesIndex: number, index: number): void {
    const point = this.seriesPoints(series)[index];
    this.hover.set({
      label: this.labels()[index] ?? '',
      seriesName: series.name,
      value: this.valueFormatter()(series.values[index]),
      color: this.seriesColor(series, this.series().indexOf(series)),
      x: point.x,
      y: point.y,
    });
  }

  protected showBarHover(bar: { series: ChartSeries; value: number; x: number; y: number; width: number }, label: string): void {
    this.hover.set({
      label,
      seriesName: bar.series.name,
      value: this.valueFormatter()(bar.value),
      color: this.seriesColor(bar.series, this.series().indexOf(bar.series)),
      x: bar.x + bar.width / 2,
      y: bar.y,
    });
  }

  protected clearHover(): void {
    this.hover.set(null);
  }

  // ---- Pie / donut ----

  protected readonly slices = computed(() => {
    const primary = this.series()[0];
    if (!primary) {
      return [];
    }
    const total = primary.values.reduce((sum, v) => sum + Math.max(0, v), 0);
    const outerRadius = Math.min(VIEW_WIDTH, VIEW_HEIGHT) / 2 - 20;
    const innerRadius = this.type() === 'donut' ? outerRadius * 0.6 : 0;
    const cx = VIEW_WIDTH / 2;
    const cy = VIEW_HEIGHT / 2;
    let angle = 0;
    return primary.values.map((value, i) => {
      const fraction = total === 0 ? 0 : Math.max(0, value) / total;
      const startAngle = angle;
      const endAngle = angle + fraction * 360;
      angle = endAngle;
      const midAngle = (startAngle + endAngle) / 2;
      return {
        label: this.labels()[i] ?? '',
        value,
        percent: fraction * 100,
        color: this.colors()[i % this.colors().length],
        path: slicePath(cx, cy, outerRadius, innerRadius, startAngle, endAngle),
        midX: cx + (outerRadius + innerRadius) * 0.5 * Math.sin((midAngle * Math.PI) / 180),
        midY: cy - (outerRadius + innerRadius) * 0.5 * Math.cos((midAngle * Math.PI) / 180),
      };
    });
  });

  protected showSliceHover(slice: { label: string; value: number; color: string; midX: number; midY: number }): void {
    this.hover.set({
      label: slice.label,
      seriesName: '',
      value: this.valueFormatter()(slice.value),
      color: slice.color,
      x: slice.midX,
      y: slice.midY,
    });
  }
}

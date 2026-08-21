import { Component, ElementRef, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { Point, areaPath, bandPath, buildTicks, linePath, niceMax, polarToCartesian, polygonPath, slicePath } from './chart-math';

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter' | 'radar';

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

interface StackedBand {
  top: Point[];
  bottom: Point[];
}

const DEFAULT_COLORS: readonly string[] = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 300;
const PADDING = { top: 16, right: 16, bottom: 32, left: 44 };
const TICK_COUNT = 4;

/**
 * An SVG chart supporting line, bar, area, scatter, radar, pie, and donut via `type` -- no canvas,
 * no external charting library, so it themes and scales like any other component. Cartesian types
 * (line/bar/area/scatter) share one axis/gridline/tooltip system, including a value domain that
 * extends below zero when any value is negative (the zero baseline moves accordingly, rather than
 * clipping negative bars/points off the bottom edge). `bar`/`area` additionally support `stacked`.
 * Pie/donut share arc math (donut is a pie with a positive `innerRadius` fraction); radar reuses
 * the same polar math around a fixed-size circle, one spoke per label. The legend is clickable,
 * toggling a series' visibility without needing to re-pass `series` from the consumer.
 *
 * RTL mirrors the whole plot via a single CSS `transform: scaleX(-1)` on the `<svg>` itself (see
 * `chart.component.css`) rather than recomputing every x-coordinate in JS -- correctness follows
 * for free from the live `:dir(rtl)` state instead of needing to invalidate a cached `computed()`
 * whenever the page's direction flips (an Angular `computed()` only re-runs when a *signal* it read
 * changes; `document.documentElement.dir` isn't one, so a JS-side mirror computed once and cached
 * would silently go stale until some other input happened to change). Axis-label `<text>` elements
 * counter-mirror in place (`transform-box: fill-box` + their own `scaleX(-1)`) so glyphs stay
 * readable. The one thing that *can't* be pure CSS is the tooltip -- a plain HTML sibling of the
 * SVG, positioned from JS-computed pixel coordinates -- so `tooltipLeftPercent()` checks
 * `:dir(rtl)` itself, freshly, every time Angular evaluates that template binding (a plain method
 * call, not a memoized signal, so it can never go stale either).
 */
@Component({
  selector: 's-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  type = input<ChartType>('line');
  labels = input<readonly string[]>([]);
  series = input<readonly ChartSeries[]>([]);
  height = input(320);
  showLegend = input(true, { transform: booleanAttribute });
  showGrid = input(true, { transform: booleanAttribute });
  /** Stacks each label's series cumulatively instead of side-by-side (bar) or layered on the zero
   * baseline (area). Only applies to `type="bar"` / `type="area"`. Assumes predominantly
   * non-negative values -- a fully general diverging stacked chart (some series positive, some
   * negative, at the same label) isn't something this cumulative-sum approach models correctly. */
  stacked = input(false, { transform: booleanAttribute });
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

  /** True SVG mirroring (the plot area, gridlines, bars, lines, points, slices) is handled entirely
   * by CSS -- see the class doc comment. This is only for the tooltip, a plain HTML overlay that
   * can't inherit that transform. Deliberately a plain method, not a `computed()`: it's read fresh
   * on every template check, which is what keeps it correct across a live direction flip. */
  protected isRtl(): boolean {
    return this.elementRef.nativeElement.matches(':dir(rtl)');
  }

  protected tooltipLeftPercent(x: number): number {
    const percent = (x / VIEW_WIDTH) * 100;
    return this.isRtl() ? 100 - percent : percent;
  }

  // ---- Cartesian (line / bar / area / scatter) ----

  private readonly plotArea = computed(() => ({
    x0: PADDING.left,
    x1: VIEW_WIDTH - PADDING.right,
    y0: PADDING.top,
    y1: VIEW_HEIGHT - PADDING.bottom,
    width: VIEW_WIDTH - PADDING.left - PADDING.right,
    height: VIEW_HEIGHT - PADDING.top - PADDING.bottom,
  }));

  /** Per-label cumulative totals when stacking a bar/area chart -- the domain has to cover the
   * *sum* at each label, not each individual series value, or a stack's upper layers would render
   * above the top of the axis. */
  private readonly stackedTotalsPerLabel = computed(() => {
    const series = this.visibleSeries();
    const count = this.labels().length;
    return Array.from({ length: count }, (_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  });

  private readonly isStackedCartesian = computed(() => this.stacked() && (this.type() === 'bar' || this.type() === 'area'));

  /** The axis value range, extended below zero whenever any value is negative -- the zero baseline
   * (see `yPosition(0)`, used by bars/areas as their fill origin) then sits partway up the plot
   * instead of always being pinned to the bottom edge, so negative values render as a bar/point
   * going *down* from zero rather than clipping off the chart entirely. */
  private readonly valueDomain = computed(() => {
    const allValues = this.isStackedCartesian() ? this.stackedTotalsPerLabel() : this.visibleSeries().flatMap((s) => s.values);
    if (allValues.length === 0) {
      return { min: 0, max: 1 };
    }
    const rawMax = Math.max(...allValues, 0);
    const rawMin = Math.min(...allValues, 0);
    return { min: rawMin < 0 ? -niceMax(-rawMin) : 0, max: niceMax(rawMax) };
  });

  protected readonly ticks = computed(() => {
    const { min, max } = this.valueDomain();
    return buildTicks(min, max, TICK_COUNT);
  });

  protected readonly gridLines = computed(() => {
    const area = this.plotArea();
    return this.ticks().map((value) => this.valueToY(value, area));
  });

  private xPosition(index: number): number {
    const area = this.plotArea();
    const count = this.labels().length;
    if (count <= 1) {
      return area.x0 + area.width / 2;
    }
    return area.x0 + (index / (count - 1)) * area.width;
  }

  private valueToY(value: number, area: ReturnType<typeof this.plotArea>): number {
    const { min, max } = this.valueDomain();
    const range = max - min;
    const fraction = range === 0 ? 0 : (value - min) / range;
    return area.y1 - fraction * area.height;
  }

  private yPosition(value: number): number {
    return this.valueToY(value, this.plotArea());
  }

  protected readonly labelPositions = computed(() => this.labels().map((label, i) => ({ label, x: this.xPosition(i) })));

  protected seriesPoints(series: ChartSeries): Point[] {
    return series.values.map((value, i) => ({ x: this.xPosition(i), y: this.yPosition(value) }));
  }

  /** Cumulative top/bottom point bands per series, only meaningful when `stacked` applies to
   * `type="area"` -- each series' fill sits on top of the running sum of every series before it,
   * rather than every series sharing the same zero baseline. */
  protected readonly stackedAreaBands = computed(() => {
    const map = new Map<string, StackedBand>();
    if (!this.isStackedCartesian() || this.type() !== 'area') {
      return map;
    }
    const series = this.visibleSeries();
    const count = this.labels().length;
    const cumulative = new Array(count).fill(0);
    for (const s of series) {
      const bottom: Point[] = [];
      const top: Point[] = [];
      for (let i = 0; i < count; i++) {
        bottom.push({ x: this.xPosition(i), y: this.yPosition(cumulative[i]) });
        cumulative[i] += s.values[i] ?? 0;
        top.push({ x: this.xPosition(i), y: this.yPosition(cumulative[i]) });
      }
      map.set(s.name, { top, bottom });
    }
    return map;
  });

  /** The points a series' line traces and its hover targets sit at -- the raw per-label value for
   * a plain line/scatter, or the cumulative top edge of its own stacked-area band. */
  protected hoverPointsFor(series: ChartSeries): Point[] {
    if (this.isStackedCartesian() && this.type() === 'area') {
      return this.stackedAreaBands().get(series.name)?.top ?? [];
    }
    return this.seriesPoints(series);
  }

  protected linePathFor(series: ChartSeries): string {
    return linePath(this.hoverPointsFor(series));
  }

  protected areaPathFor(series: ChartSeries): string {
    if (this.isStackedCartesian()) {
      const band = this.stackedAreaBands().get(series.name);
      return band ? bandPath(band.top, band.bottom) : '';
    }
    return areaPath(this.seriesPoints(series), this.yPosition(0));
  }

  protected readonly barGroups = computed(() => {
    const area = this.plotArea();
    const series = this.visibleSeries();
    const count = this.labels().length;
    if (count === 0 || series.length === 0) {
      return [];
    }
    const slotWidth = area.width / count;

    if (this.stacked()) {
      const groupPadding = slotWidth * 0.15;
      const barWidth = slotWidth - groupPadding * 2;
      return this.labels().map((label, labelIndex) => {
        let cumulative = 0;
        const bars = series.map((s) => {
          const value = s.values[labelIndex] ?? 0;
          const yStart = this.yPosition(cumulative);
          cumulative += value;
          const yEnd = this.yPosition(cumulative);
          return {
            series: s,
            value,
            x: area.x0 + labelIndex * slotWidth + groupPadding,
            y: Math.min(yStart, yEnd),
            width: barWidth,
            height: Math.abs(yEnd - yStart),
          };
        });
        return { label, bars };
      });
    }

    const groupPadding = slotWidth * 0.15;
    const barWidth = (slotWidth - groupPadding * 2) / series.length;
    return this.labels().map((label, labelIndex) => ({
      label,
      bars: series.map((s, seriesIndex) => {
        const value = s.values[labelIndex] ?? 0;
        const zeroY = this.yPosition(0);
        const valueY = this.yPosition(value);
        return {
          series: s,
          value,
          x: area.x0 + labelIndex * slotWidth + groupPadding + seriesIndex * barWidth,
          y: Math.min(zeroY, valueY),
          width: barWidth,
          height: Math.abs(zeroY - valueY),
        };
      }),
    }));
  });

  protected showPointHover(event: MouseEvent, series: ChartSeries, seriesIndex: number, index: number): void {
    const point = this.hoverPointsFor(series)[index];
    if (!point) {
      return;
    }
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

  // ---- Radar ----

  private readonly radarCenter = { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 };
  /** Same "fit inside the smaller of the two view dimensions" rule pie/donut already use -- a
   * radar's polygon wants roughly equal reach in every direction, which a fixed 600x300 (landscape)
   * viewBox can't give it edge-to-edge without the same centered, height-bound circle pie already
   * settled on. */
  private readonly radarOuterRadius = Math.min(VIEW_WIDTH, VIEW_HEIGHT) / 2 - 20;

  protected readonly radarAxes = computed(() => {
    const labels = this.labels();
    const count = labels.length;
    if (count === 0) {
      return [];
    }
    const anglePer = 360 / count;
    return labels.map((label, i) => ({ label, angle: i * anglePer }));
  });

  /** Radar has no meaningful "negative radius" -- values below zero clamp to the center instead of
   * extending the domain the way the cartesian types do. */
  protected readonly radarMaxValue = computed(() => {
    const all = this.visibleSeries().flatMap((s) => s.values);
    return niceMax(all.length > 0 ? Math.max(...all, 0) : 1);
  });

  protected readonly radarGridRings = computed(() => buildTicks(0, this.radarMaxValue(), TICK_COUNT).filter((value) => value > 0));

  protected radarRingPath(ringValue: number): string {
    const max = this.radarMaxValue();
    const radius = max === 0 ? 0 : (ringValue / max) * this.radarOuterRadius;
    const points = this.radarAxes().map((axis) => polarToCartesian(this.radarCenter.x, this.radarCenter.y, radius, axis.angle));
    return polygonPath(points);
  }

  protected radarSpokeEnd(angle: number): Point {
    return polarToCartesian(this.radarCenter.x, this.radarCenter.y, this.radarOuterRadius, angle);
  }

  protected radarLabelPosition(angle: number): Point {
    return polarToCartesian(this.radarCenter.x, this.radarCenter.y, this.radarOuterRadius + 14, angle);
  }

  protected radarSeriesPoints(series: ChartSeries): Point[] {
    const max = this.radarMaxValue();
    return this.radarAxes().map((axis, i) => {
      const value = Math.max(0, series.values[i] ?? 0);
      const radius = max === 0 ? 0 : (value / max) * this.radarOuterRadius;
      return polarToCartesian(this.radarCenter.x, this.radarCenter.y, radius, axis.angle);
    });
  }

  protected radarPathFor(series: ChartSeries): string {
    return polygonPath(this.radarSeriesPoints(series));
  }

  protected showRadarPointHover(series: ChartSeries, index: number): void {
    const point = this.radarSeriesPoints(series)[index];
    if (!point) {
      return;
    }
    this.hover.set({
      label: this.labels()[index] ?? '',
      seriesName: series.name,
      value: this.valueFormatter()(series.values[index] ?? 0),
      color: this.seriesColor(series, this.series().indexOf(series)),
      x: point.x,
      y: point.y,
    });
  }
}

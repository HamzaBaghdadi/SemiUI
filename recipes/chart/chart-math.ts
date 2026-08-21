export interface Point {
  x: number;
  y: number;
}

/** Rounds a raw axis bound up to a "nice" number (1/2/5 x a power of ten) so gridline labels read
 * cleanly. Guards non-finite input (NaN/Infinity can otherwise arrive from a `Math.max` over an
 * empty or garbage-value series) and non-positive input, both falling back to `1` rather than
 * propagating a broken value into every downstream position calculation. */
export function niceMax(rawMax: number): number {
  if (!Number.isFinite(rawMax) || rawMax <= 0) {
    return 1;
  }
  const exponent = Math.floor(Math.log10(rawMax));
  const magnitude = Math.pow(10, exponent);
  const fraction = rawMax / magnitude;
  let niceFraction: number;
  if (fraction <= 1) {
    niceFraction = 1;
  } else if (fraction <= 2) {
    niceFraction = 2;
  } else if (fraction <= 5) {
    niceFraction = 5;
  } else {
    niceFraction = 10;
  }
  return niceFraction * magnitude;
}

/** `count + 1` evenly spaced ticks from `min` to `max` inclusive -- `min` need not be zero, so a
 * chart with negative values gets ticks (and a zero baseline) below the axis, not just above it.
 * Guards `count <= 0` and a degenerate/non-finite range, both of which otherwise divide-by-zero or
 * NaN-propagate into every tick. */
export function buildTicks(min: number, max: number, count: number): number[] {
  if (count <= 0 || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return [Number.isFinite(min) ? min : 0];
  }
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, i) => Math.round((min + step * i) * 100) / 100);
}

export function linePath(points: readonly Point[]): string {
  if (points.length === 0) {
    return '';
  }
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

/** A closed path for a filled area chart: the line, then straight down to the baseline and back to
 * the start. `baselineY` is the pixel Y of value `0` -- not necessarily the plot area's bottom
 * edge, since a chart with negative values has its baseline partway up the axis. */
export function areaPath(points: readonly Point[], baselineY: number): string {
  if (points.length === 0) {
    return '';
  }
  const line = linePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

/** A closed band between two point sequences -- `topPoints` left-to-right, then `bottomPoints`
 * back right-to-left -- for a stacked-area layer sitting on top of the previous layer's cumulative
 * sum instead of on the zero baseline. Both arrays must be the same length and index-aligned (the
 * same x position per pair). */
export function bandPath(topPoints: readonly Point[], bottomPoints: readonly Point[]): string {
  if (topPoints.length === 0 || bottomPoints.length !== topPoints.length) {
    return '';
  }
  const top = linePath(topPoints);
  const bottomReversed = [...bottomPoints].reverse();
  const bottomLine = bottomReversed.map((p) => `L ${p.x} ${p.y}`).join(' ');
  return `${top} ${bottomLine} Z`;
}

/** 0 degrees = 12 o'clock, clockwise -- shared by pie/donut slices and radar spokes/vertices. */
export function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * An SVG path for one pie/donut slice, from `startAngle` to `endAngle` (degrees, 0 = 12 o'clock,
 * clockwise). `innerRadius` of 0 produces a solid pie wedge reaching the center; a positive value
 * produces a donut ring segment instead.
 */
export function slicePath(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number): string {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  if (innerRadius <= 0) {
    return `M ${cx} ${cy} L ${startOuter.x} ${startOuter.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y} Z`;
  }
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${startInner.x} ${startInner.y}`,
    'Z',
  ].join(' ');
}

/** A closed polygon path -- the radar equivalent of `areaPath`, but closing straight back to the
 * first point instead of dropping to a baseline (a radar series has no baseline, every vertex sits
 * directly on its own spoke). */
export function polygonPath(points: readonly Point[]): string {
  if (points.length === 0) {
    return '';
  }
  return `${linePath(points)} Z`;
}

export interface Point {
  x: number;
  y: number;
}

/** Rounds a raw axis max up to a "nice" number (1/2/5 x a power of ten) so gridline labels read cleanly. */
export function niceMax(rawMax: number): number {
  if (rawMax <= 0) {
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

export function buildTicks(max: number, count: number): number[] {
  const step = max / count;
  return Array.from({ length: count + 1 }, (_, i) => Math.round(step * i * 100) / 100);
}

export function linePath(points: readonly Point[]): string {
  if (points.length === 0) {
    return '';
  }
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

/** A closed path for a filled area chart: the line, then straight down to the baseline and back to the start. */
export function areaPath(points: readonly Point[], baselineY: number): string {
  if (points.length === 0) {
    return '';
  }
  const line = linePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number): Point {
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

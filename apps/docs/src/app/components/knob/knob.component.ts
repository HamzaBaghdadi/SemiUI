import { Component, booleanAttribute, computed, input } from '@angular/core';

/** Internal SVG coordinate space -- fixed regardless of `size`, same technique Chart uses (a
 * constant viewBox scaled to whatever pixel size the host renders at via CSS, rather than
 * recomputing geometry from a variable size). `strokeWidth` is expressed in this same 100-unit
 * space, so it scales proportionally with `size` automatically instead of needing its own
 * conversion. */
const VIEW_SIZE = 100;

/**
 * A radial gauge: a circular progress ring showing where `value` sits between `min` and `max`,
 * with the value (and an optional label) centered inside. Adapted from PrimeNG's Knob, but
 * deliberately not a form control the way that one is -- no drag-to-set interaction, no
 * ControlValueAccessor, no `BaseFormFieldControl`. This is a chart type (a single-value gauge,
 * the radial counterpart to Chart's pie/donut), meant for *displaying* a metric, not collecting
 * one -- pass a new `value` to animate it, the same way you'd update any other chart's data.
 */
@Component({
  selector: 's-knob',
  templateUrl: './knob.component.html',
  styleUrl: './knob.component.css',
})
export class KnobComponent {
  value = input(0);
  min = input(0);
  max = input(100);
  /** Rendered diameter, in pixels. */
  size = input(120);
  /** Ring thickness, in the same 100-unit space `size` scales to -- roughly proportional to `size`, not a fixed pixel count. */
  strokeWidth = input(8);
  /** Shows the formatted value (and `label`, if set) centered inside the ring. */
  showValue = input(true, { transform: booleanAttribute });
  /** Small text below the value, e.g. a unit or metric name. */
  label = input('');
  /** Overrides the ring's filled-arc color. Defaults to `var(--semiui-color-primary)` when omitted -- the same token the center text uses, so they match unless you deliberately override just the arc. */
  color = input<string>();
  valueFormatter = input<(value: number) => string>((value) => String(Math.round(value)));

  protected readonly viewSize = VIEW_SIZE;

  protected readonly clampedValue = computed(() => Math.min(this.max(), Math.max(this.min(), this.value())));

  protected readonly valueFraction = computed(() => {
    const range = this.max() - this.min();
    return range <= 0 ? 0 : (this.clampedValue() - this.min()) / range;
  });

  protected readonly radius = computed(() => (VIEW_SIZE - this.strokeWidth()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly dashOffset = computed(() => this.circumference() * (1 - this.valueFraction()));

  protected readonly resolvedColor = computed(() => this.color() ?? 'var(--semiui-color-primary)');
  protected readonly displayValue = computed(() => this.valueFormatter()(this.clampedValue()));
}

import { Component, booleanAttribute, input } from '@angular/core';
import { Severity } from '@semiui/tokens';

export type ProgressBarSize = 'sm' | 'md' | 'lg';

/**
 * A linear progress indicator: `value` (0-100) for determinate progress, or `indeterminate` for
 * an unbounded loading loop. `color` reuses Button's own variant tokens (a progress fill is just
 * a colored bar -- no reason to duplicate that palette under its own token set).
 */
@Component({
  selector: 's-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css',
  host: {
    class: 's-progress-bar',
    role: 'progressbar',
    '[attr.aria-valuenow]': 'indeterminate() ? null : clampedValue()',
    '[attr.aria-valuemin]': 'indeterminate() ? null : 0',
    '[attr.aria-valuemax]': 'indeterminate() ? null : 100',
    '[attr.data-size]': 'size()',
    '[attr.data-color]': 'color()',
  },
})
export class ProgressBarComponent {
  /** 0-100. Ignored (the bar becomes an indeterminate loop instead) when `indeterminate` is set. */
  value = input(0);
  indeterminate = input(false, { transform: booleanAttribute });
  showValue = input(false, { transform: booleanAttribute });
  size = input<ProgressBarSize>('md');
  color = input<Severity>('primary');

  protected clampedValue(): number {
    return Math.min(100, Math.max(0, this.value()));
  }
}

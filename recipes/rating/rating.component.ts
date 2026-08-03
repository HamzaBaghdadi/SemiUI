import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { ButtonSize } from '@semiui/tokens';
import { injectSemiUIIcons } from '@semiui/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

/**
 * A star rating: whole stars only, `maxStars` of them, clicking the currently-selected star clears
 * it. Supports ngModel, reactive forms, and Signal Forms through `BaseFormFieldControl`. The bound
 * value is `number | null` -- `null` for no rating, matching Angular Signal Forms' own documented
 * convention for numeric custom controls (see `FormValueControl<number | null>` in its source).
 *
 * `readOnly` and `maxStars` are deliberately not named `readonly`/`max`: `FormUiControl` reserves
 * both of those exact names (auto-wired by the `Field`/`FormField` directive from the bound
 * field's own readonly state and max-value validator respectively), and colliding with them
 * produces a confusing, unrelated-looking type error at the `[formField]` binding site rather than
 * at the actual property declaration.
 */
@Component({
  selector: 's-rating',
  imports: [SIconComponent, ErrorMessageComponent],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css',
  host: {
    role: 'group',
    '[attr.data-size]': 'size()',
    '[attr.data-disabled]': 'effectiveDisabled() ? \'\' : null',
  },
})
export class RatingComponent extends BaseFormFieldControl<number | null> {
  protected readonly icons = injectSemiUIIcons();

  maxStars = input(5);
  size = input<ButtonSize>('md');
  readOnly = input(false, { transform: booleanAttribute });
  errorMessage = input('');

  protected readonly hoverValue = signal<number | null>(null);
  protected readonly displayValue = computed(() => this.hoverValue() ?? this.value() ?? 0);
  protected readonly starIndices = computed(() => Array.from({ length: this.maxStars() }, (_, i) => i + 1));

  protected override emptyValue(): number | null {
    return null;
  }

  protected onStarClick(star: number): void {
    if (this.effectiveDisabled() || this.readOnly()) {
      return;
    }
    this.value.set(star === this.value() ? null : star);
    // Without this, displayValue() keeps showing the pre-click hover preview (this same star,
    // still filled) until the pointer genuinely moves to a different star -- clicking to clear
    // would visually look like it did nothing until the mouse moves away.
    this.hoverValue.set(null);
  }

  protected onStarEnter(star: number): void {
    if (this.effectiveDisabled() || this.readOnly()) {
      return;
    }
    this.hoverValue.set(star);
  }

  protected onGroupLeave(): void {
    this.hoverValue.set(null);
  }
}

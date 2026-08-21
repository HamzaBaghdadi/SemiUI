import { Component, ElementRef, booleanAttribute, input, viewChildren } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { ButtonSize, ButtonVariant, IconRef } from '@semiui/tokens';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export interface ToggleGroupItem<TValue = unknown> {
  label: string;
  value: TValue;
  icon?: IconRef;
  disabled?: boolean;
}

/**
 * A segmented control of Toggle-Button-styled segments: single-select (exclusive, click again to
 * clear) by default, or `multiple` for independent per-segment toggling. `value` is a single item
 * value in single mode, an array of item values in `multiple` mode -- same shape Multiselect uses
 * for its own value. Segments are plain `<button>`s in this component's own template (not a
 * composed/projected child), so unlike Split Button this doesn't need `ViewEncapsulation.None` --
 * normal emulated encapsulation already reaches everything it needs to style.
 */
@Component({
  selector: 's-toggle-group',
  imports: [SIconComponent, ErrorMessageComponent],
  templateUrl: './toggle-group.component.html',
  styleUrl: './toggle-group.component.css',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '(focusout)': 'handleBlur()',
  },
})
export class ToggleGroupComponent<TValue = unknown> extends BaseFormFieldControl<
  TValue | TValue[] | null
> {
  private readonly segments = viewChildren<ElementRef<HTMLButtonElement>>('segment');

  items = input<readonly ToggleGroupItem<TValue>[]>([]);
  multiple = input(false, { transform: booleanAttribute });
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  errorMessage = input('');

  /** Doesn't branch on `multiple()` -- that input is a subclass field, not yet initialized when
   * the base class's own `value` field initializer calls this (base class fields run before a
   * derived class's field initializers, even though this override runs via prototype dispatch).
   * Returning the same empty value either way is fine: `isSelected`/`toggleItem` already treat any
   * non-array value as an empty selection in multiple mode.
   *
   * `null`, not `undefined` -- writing `undefined` into a Signal Forms model deletes that property
   * from the model object, which orphans the field node (NG01902 "Orphan field") and permanently
   * breaks the view's reactive graph: every later read throws and the DOM silently stops updating
   * (so deselecting once would leave the whole group frozen). `null` keeps the property present. */
  protected override emptyValue(): TValue | TValue[] | null {
    return null;
  }

  focus(options?: FocusOptions): void {
    this.focusTarget()?.focus(options);
  }

  /** The first selected segment's button if there is one, otherwise the first segment. */
  protected override focusTarget(): HTMLElement | null {
    const segments = this.segments();
    const selectedIndex = this.items().findIndex((item) => this.isSelected(item));
    return (selectedIndex >= 0 ? segments[selectedIndex] : segments[0])?.nativeElement ?? null;
  }

  protected isSelected(item: ToggleGroupItem<TValue>): boolean {
    const current = this.value();
    if (this.multiple()) {
      return Array.isArray(current) && current.includes(item.value);
    }
    return current === item.value;
  }

  protected toggleItem(item: ToggleGroupItem<TValue>): void {
    if (this.effectiveDisabled() || item.disabled) {
      return;
    }
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? (this.value() as TValue[]) : [];
      const next = current.includes(item.value)
        ? current.filter((v) => v !== item.value)
        : [...current, item.value];
      this.value.set(next);
    } else {
      this.value.set(this.value() === item.value ? this.emptyValue() : item.value);
    }
  }
}

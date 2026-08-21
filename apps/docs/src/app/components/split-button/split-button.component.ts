import { Component, booleanAttribute, computed, input, output } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { ButtonSize, ButtonVariant, IconRef } from '@semiui/tokens';
import { injectSemiUIIcons } from '@semiui/theme';
import { PopoverComponent } from '../popover/popover.component';

export interface SplitButtonItem {
  label: string;
  icon?: IconRef;
  disabled?: boolean;
}

/**
 * A primary action button with a caret that opens a menu of secondary actions. Both segments are
 * plain native `<button>`s styled directly by this component (pointed at Button's own design
 * tokens, the same indirection Toggle Button uses) rather than two composed `<s-button>`
 * instances -- that composition previously needed `ViewEncapsulation.None` to visually merge the
 * two components' internals, and left the toggle segment's height at the mercy of whatever
 * Button's own icon-only sizing happened to compute. Owning the markup directly sidesteps both:
 * normal encapsulation is enough since there's no child component boundary to reach across, and
 * `align-items: stretch` on `.s-split-button__group` guarantees the icon-only toggle always
 * matches the labeled main segment's height, because they're now direct sibling flex items
 * instead of separate custom-element hosts.
 */
@Component({
  selector: 's-split-button',
  imports: [PopoverComponent, SIconComponent],
  templateUrl: './split-button.component.html',
  styleUrl: './split-button.component.css',
  host: {
    class: 's-split-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class SplitButtonComponent {
  protected readonly icons = injectSemiUIIcons();

  items = input<readonly SplitButtonItem[]>([]);
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });

  /** Emitted when the main action is pressed. */
  pressed = output<void>();
  /** Emitted with the item when a menu entry is picked. */
  itemSelected = output<SplitButtonItem>();

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected selectItem(item: SplitButtonItem): void {
    if (item.disabled) {
      return;
    }
    this.itemSelected.emit(item);
  }
}

import { Component, ElementRef, HostListener, booleanAttribute, inject, input, output, signal } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { ButtonSize, ButtonVariant, IconRef } from '@semiui/tokens';
import { injectSemiUIIcons } from '@semiui/theme';
import { ButtonComponent } from '../button/button.component';

export interface SpeedDialItem {
  label: string;
  icon?: IconRef;
  disabled?: boolean;
}

export type SpeedDialDirection = 'up' | 'down' | 'left' | 'right';

/**
 * A floating action button that expands into a linear list of mini action buttons -- composes
 * Button (both the trigger and each action) rather than reimplementing it. Each action's CSS
 * transition-delay is staggered off its index via the `--s-speed-dial-index` custom property, so
 * they fan out one after another instead of all animating at once.
 */
@Component({
  selector: 's-speed-dial',
  imports: [ButtonComponent, SIconComponent],
  templateUrl: './speed-dial.component.html',
  styleUrl: './speed-dial.component.css',
  host: {
    class: 's-speed-dial',
    '[attr.data-direction]': 'direction()',
    '[attr.data-size]': 'size()',
    '[attr.data-open]': 'open() ? \'\' : null',
  },
})
export class SpeedDialComponent {
  protected readonly icons = injectSemiUIIcons();
  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  items = input<readonly SpeedDialItem[]>([]);
  direction = input<SpeedDialDirection>('up');
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  /** Icon shown on the trigger while closed. Defaults to a generic "+" glyph. */
  icon = input<IconRef>();
  /** Icon shown on the trigger while open. Defaults to a generic "x" glyph. */
  openIcon = input<IconRef>();
  disabled = input(false, { transform: booleanAttribute });

  /** Emitted with the item when an action is picked; the dial closes right after. */
  itemSelected = output<SpeedDialItem>();

  protected readonly open = signal(false);

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.open.update((value) => !value);
  }

  protected selectItem(item: SpeedDialItem): void {
    if (item.disabled) {
      return;
    }
    this.itemSelected.emit(item);
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const target = event.target as Node;
    if (!this.elRef.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }
}

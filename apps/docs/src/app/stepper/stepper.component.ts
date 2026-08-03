import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, booleanAttribute, computed, contentChild, input, model } from '@angular/core';
import { ZIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';

export interface StepItem {
  label: string;
  description?: string;
  disabled?: boolean;
}

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepState = 'completed' | 'active' | 'upcoming';

/**
 * A step progress indicator: pass `items` (each needs at least a `label`). Clicking a step's
 * circle jumps to it, unless `linear` is set -- then only completed/active steps and the single
 * next step are reachable by click, blocking jumps of more than one step ahead. An optional
 * `#content` template slot renders the active step's panel below the indicator row, same
 * convention as Tabs' `#content` -- omit it to use Stepper as a pure visual indicator alongside
 * content you manage elsewhere.
 */
@Component({
  selector: 'z-stepper',
  imports: [ZIconComponent, NgTemplateOutlet],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
  host: {
    '[attr.data-orientation]': 'orientation()',
  },
})
export class StepperComponent<TItem extends StepItem = StepItem> {
  protected readonly icons = injectSemiUIIcons();

  items = input<readonly TItem[]>([]);
  /** The current step's index. Two-way bindable. */
  activeIndex = model(0);
  orientation = input<StepperOrientation>('horizontal');
  /** When set, clicking a step ahead of the next one is blocked -- forward progress must go through `next()`. */
  linear = input(false, { transform: booleanAttribute });

  /** The active step's panel content. Context: the active item and its index. Optional -- omit to use Stepper as a pure indicator. */
  protected contentTemplate = contentChild<unknown, TemplateRef<{ $implicit: TItem; index: number }>>('content', {
    read: TemplateRef,
  });

  protected readonly isFirst = computed(() => this.activeIndex() === 0);
  protected readonly isLast = computed(() => this.activeIndex() === this.items().length - 1);

  protected stepState(index: number): StepState {
    if (index < this.activeIndex()) {
      return 'completed';
    }
    return index === this.activeIndex() ? 'active' : 'upcoming';
  }

  protected canNavigateTo(index: number, item: TItem): boolean {
    if (item.disabled) {
      return false;
    }
    if (this.linear() && index > this.activeIndex() + 1) {
      return false;
    }
    return true;
  }

  protected selectStep(index: number, item: TItem): void {
    if (this.canNavigateTo(index, item)) {
      this.activeIndex.set(index);
    }
  }

  next(): void {
    if (!this.isLast()) {
      this.activeIndex.update((index) => index + 1);
    }
  }

  previous(): void {
    if (!this.isFirst()) {
      this.activeIndex.update((index) => index - 1);
    }
  }
}

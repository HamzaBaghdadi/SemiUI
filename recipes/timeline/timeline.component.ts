import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, computed, contentChild, input } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { IconRef, Severity } from '@semiui/tokens';

export interface TimelineItem {
  title?: string;
  content?: string;
  date?: string;
  icon?: IconRef;
  /** Points the marker at one of Button's own variant tokens instead of the default neutral dot. */
  color?: Severity;
}

export type TimelineOrientation = 'vertical' | 'horizontal';
/** Vertical only: which side of the axis the content renders on. 'alternate' flips per entry,
 * putting the date on the opposite side from the content -- the classic centered timeline look.
 * Horizontal always renders content below the axis, so this is ignored in that orientation. */
export type TimelineAlign = 'left' | 'right' | 'alternate';

export interface TimelineItemContext<TItem> {
  $implicit: TItem;
  index: number;
}

/**
 * A vertical or horizontal sequence of events: pass `items` (each is entirely optional fields --
 * `title`/`content`/`date`/`icon`/`color`, use whichever apply). `#content` and `#marker` template
 * slots override the default rendering per entry, same context (`{ $implicit: item, index }`) as
 * Stepper/Accordion's own content slots. Reuses Stepper's own connector/marker-size tokens (a
 * timeline is structurally the same shape as a stepper -- markers joined by a connector line --
 * just without progress state), and Button's variant tokens for the optional per-item `color`.
 */
@Component({
  selector: 's-timeline',
  imports: [SIconComponent, NgTemplateOutlet],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css',
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-align]': 'orientation() === "vertical" ? align() : null',
  },
})
export class TimelineComponent<TItem extends TimelineItem = TimelineItem> {
  items = input<readonly TItem[]>([]);
  orientation = input<TimelineOrientation>('vertical');
  align = input<TimelineAlign>('left');

  /** Custom entry body. Context: the item and its index. Falls back to title/content/date text. */
  protected contentTemplate = contentChild<unknown, TemplateRef<TimelineItemContext<TItem>>>('content', {
    read: TemplateRef,
  });
  /** Custom marker content (replaces the dot/icon). Context: the item and its index. */
  protected markerTemplate = contentChild<unknown, TemplateRef<TimelineItemContext<TItem>>>('marker', {
    read: TemplateRef,
  });

  protected readonly isAlternate = computed(() => this.orientation() === 'vertical' && this.align() === 'alternate');

  /** Which side (of the middle axis, in alternate mode) this entry's real content lands on --
   * irrelevant outside alternate mode, where content always follows `align` as a whole. */
  protected contentOnRight(index: number): boolean {
    return index % 2 === 1;
  }

  protected markerColorVar(item: TItem): string | null {
    return item.color ? `var(--semiui-comp-button-variants-${item.color}-background)` : null;
  }
}

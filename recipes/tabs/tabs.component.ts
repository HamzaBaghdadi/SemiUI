import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  TemplateRef,
  afterRenderEffect,
  contentChild,
  input,
  model,
  signal,
  viewChildren,
} from '@angular/core';

export interface TabItem {
  label: string;
  disabled?: boolean;
}

export type TabsOrientation = 'horizontal' | 'vertical';

let nextTabsId = 0;

/**
 * A data-driven tab strip: pass `items` (each needs at least a `label`) and render each panel's
 * body through the required `#content` template slot -- same convention as Accordion's `#content`
 * and Select's `#option`. Only the active panel is rendered. Keyboard navigation follows the ARIA
 * "tabs" pattern (roving tabindex): arrow keys move focus and selection together, Home/End jump to
 * the first/last enabled tab. The sliding indicator bar is positioned by measuring the active
 * tab's real rendered size, so it works correctly with variable-width labels.
 */
@Component({
  selector: 's-tabs',
  imports: [NgTemplateOutlet],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
  host: {
    '[attr.data-orientation]': 'orientation()',
  },
})
export class TabsComponent<TItem extends TabItem = TabItem> {
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  protected readonly tabsId = `s-tabs-${nextTabsId++}`;

  items = input<readonly TItem[]>([]);
  /** The selected tab's index. Two-way bindable. */
  activeIndex = model(0);
  orientation = input<TabsOrientation>('horizontal');

  /** Custom label rendering. Context: the item and its index. Falls back to plain `item.label` text. */
  protected labelTemplate = contentChild<unknown, TemplateRef<{ $implicit: TItem; index: number }>>('label', {
    read: TemplateRef,
  });
  /** The active panel's body. Context: the active item and its index. */
  protected contentTemplate = contentChild.required<unknown, TemplateRef<{ $implicit: TItem; index: number }>>(
    'content',
    { read: TemplateRef },
  );

  protected readonly indicatorStyle = signal<{ transform: string; width: string; height: string }>({
    transform: 'translate(0, 0)',
    width: '0px',
    height: '0px',
  });

  private readonly positionIndicator = afterRenderEffect(() => {
    const index = this.activeIndex();
    const button = this.tabButtons()[index]?.nativeElement;
    if (!button) {
      return;
    }
    // Only the axis that actually varies gets a transform -- the indicator's cross-axis position
    // (bottom-anchored underline, or right-anchored rail) is pinned by CSS, so leaving the other
    // axis untouched here avoids fighting that with an unwanted offset.
    const vertical = this.orientation() === 'vertical';
    this.indicatorStyle.set({
      transform: vertical ? `translateY(${button.offsetTop}px)` : `translateX(${button.offsetLeft}px)`,
      width: `${button.offsetWidth}px`,
      height: `${button.offsetHeight}px`,
    });
  });

  protected selectTab(index: number, item: TItem): void {
    if (item.disabled) {
      return;
    }
    this.activeIndex.set(index);
  }

  protected onTabKeydown(event: KeyboardEvent, index: number): void {
    const items = this.items();
    const isVertical = this.orientation() === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    let targetIndex: number | null = null;
    if (event.key === nextKey) {
      targetIndex = this.nextEnabledIndex(index, 1);
    } else if (event.key === prevKey) {
      targetIndex = this.nextEnabledIndex(index, -1);
    } else if (event.key === 'Home') {
      targetIndex = this.nextEnabledIndex(-1, 1);
    } else if (event.key === 'End') {
      targetIndex = this.nextEnabledIndex(items.length, -1);
    }

    if (targetIndex !== null) {
      event.preventDefault();
      this.activeIndex.set(targetIndex);
      this.tabButtons()[targetIndex]?.nativeElement.focus();
    }
  }

  private nextEnabledIndex(from: number, direction: 1 | -1): number | null {
    const items = this.items();
    const count = items.length;
    for (let step = 1; step <= count; step++) {
      const index = (from + direction * step + count) % count;
      if (!items[index]?.disabled) {
        return index;
      }
    }
    return null;
  }

  protected tabId(index: number): string {
    return `${this.tabsId}-tab-${index}`;
  }

  protected panelId(index: number): string {
    return `${this.tabsId}-panel-${index}`;
  }
}

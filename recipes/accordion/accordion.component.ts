import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, afterRenderEffect, booleanAttribute, contentChild, input, signal } from '@angular/core';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { injectZaytoonIcons } from '@zaytoon/theme';

export interface AccordionItem {
  header: string;
  disabled?: boolean;
}

let nextAccordionId = 0;

/**
 * A data-driven accordion: pass `items` (each needs at least a `header`) and render each panel's
 * body through the required `#content` template slot. `#header` is optional, for custom header
 * rendering beyond plain text. Single-open by default; set `multiple` to allow several panels open
 * at once. The expand/collapse animation is pure CSS (grid-template-rows 0fr/1fr), so it works
 * without measuring content height in JS.
 */
@Component({
  selector: 'z-accordion',
  imports: [ZIconComponent, NgTemplateOutlet],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.css',
})
export class AccordionComponent<TItem extends AccordionItem = AccordionItem> {
  protected readonly icons = injectZaytoonIcons();
  protected readonly accordionId = `z-accordion-${nextAccordionId++}`;

  items = input<readonly TItem[]>([]);
  /** Allows more than one panel to stay open at once. Default: only one panel open at a time. */
  multiple = input(false, { transform: booleanAttribute });
  /** Indices expanded on initial render. */
  defaultOpenIndices = input<readonly number[]>([]);

  /** Custom header rendering. Context: the item and its index. */
  protected headerTemplate = contentChild<unknown, TemplateRef<{ $implicit: TItem; index: number }>>('header', {
    read: TemplateRef,
  });
  /** Panel body content. Context: the item and its index. */
  protected contentTemplate = contentChild.required<unknown, TemplateRef<{ $implicit: TItem; index: number }>>(
    'content',
    { read: TemplateRef },
  );

  protected readonly openIndices = signal<ReadonlySet<number>>(new Set<number>());
  private hasSeededDefaultOpen = false;

  /** Signal inputs aren't guaranteed to hold their bound value yet in the constructor, so the
   * initial open set is seeded here instead, once, after the first render. */
  private readonly seedDefaultOpenIndices = afterRenderEffect(() => {
    if (this.hasSeededDefaultOpen) {
      return;
    }
    this.hasSeededDefaultOpen = true;
    this.openIndices.set(new Set(this.defaultOpenIndices()));
  });

  protected isOpen(index: number): boolean {
    return this.openIndices().has(index);
  }

  protected toggle(index: number, item: TItem): void {
    if (item.disabled) {
      return;
    }
    this.openIndices.update((current) => {
      const isOpen = current.has(index);
      const next = new Set(this.multiple() ? current : []);
      if (isOpen) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  protected headerId(index: number): string {
    return `${this.accordionId}-header-${index}`;
  }

  protected panelId(index: number): string {
    return `${this.accordionId}-panel-${index}`;
  }
}

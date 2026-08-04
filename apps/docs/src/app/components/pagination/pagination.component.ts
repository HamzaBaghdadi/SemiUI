import { Component, booleanAttribute, computed, input, model } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Page-number buttons with prev/next (and optional first/last), collapsing to an ellipsis for large page counts. */
@Component({
  selector: 's-pagination',
  imports: [SIconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  protected readonly icons = injectSemiUIIcons();

  /** 1-indexed current page. */
  page = model(1);
  pageCount = input(1);
  /** How many page numbers to show on each side of the current page. */
  siblingCount = input(1);
  showFirstLast = input(true, { transform: booleanAttribute });

  protected readonly pageItems = computed<(number | 'ellipsis')[]>(() => {
    const total = Math.max(this.pageCount(), 1);
    const current = Math.min(Math.max(this.page(), 1), total);
    const siblings = this.siblingCount();

    const totalPageNumbers = siblings * 2 + 5;
    if (totalPageNumbers >= total) {
      return range(1, total);
    }

    const leftSiblingIndex = Math.max(current - siblings, 1);
    const rightSiblingIndex = Math.min(current + siblings, total);
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < total - 2;

    if (!showLeftDots && showRightDots) {
      return [...range(1, 3 + siblings * 2), 'ellipsis', total];
    }
    if (showLeftDots && !showRightDots) {
      return [1, 'ellipsis', ...range(total - (3 + siblings * 2) + 1, total)];
    }
    if (showLeftDots && showRightDots) {
      return [1, 'ellipsis', ...range(leftSiblingIndex, rightSiblingIndex), 'ellipsis', total];
    }
    return range(1, total);
  });

  protected goTo(target: number): void {
    const total = this.pageCount();
    const clamped = Math.min(Math.max(target, 1), total);
    if (clamped !== this.page()) {
      this.page.set(clamped);
    }
  }
}

import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  TemplateRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  signal,
} from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';
import { CheckboxComponent } from '../checkbox/checkbox.component';

export interface TreeTableColumn<T = unknown> {
  field: string;
  header: string;
  width?: string;
  /** 'start'/'end' follow reading direction (flip under RTL) -- prefer them over 'left'/'right'. */
  align?: 'left' | 'center' | 'right' | 'start' | 'end';
}

export interface TreeNode<T = Record<string, unknown>> {
  data: T;
  children?: TreeNode<T>[];
  /** Initial expanded state, read once on first render -- same convention as Accordion's
   * `defaultOpenIndices`. After that, expansion is tracked entirely by this component. */
  expanded?: boolean;
}

export type TreeTableSelectionMode = 'none' | 'single' | 'multiple';

export interface TreeTableCellContext<T> {
  $implicit: unknown;
  node: TreeNode<T>;
  column: TreeTableColumn<T>;
  value: unknown;
  level: number;
}

interface VisibleRow<T> {
  node: TreeNode<T>;
  level: number;
}

/**
 * A hierarchical data table: pass `columns` and `nodes` (each node wraps its row `data` plus
 * optional `children`). The first column gets an indent and expand/collapse toggle per row's
 * depth; every other column renders like Table's own. Selection tracks node identity directly
 * (no `rowKey` function needed, unlike Table) since tree nodes are naturally unique object
 * references, not rows re-created from a flat array on every render. Deliberately narrower than
 * Table -- no sorting/filtering/pagination, since reconciling those against a live hierarchy (does
 * a filter match hide an ancestor whose only match is three levels down?) is a different, much
 * larger feature -- this is the hierarchical-data-plus-columns half of Table on its own.
 */
@Component({
  selector: 's-tree-table',
  imports: [SIconComponent, NgTemplateOutlet, CheckboxComponent],
  templateUrl: './tree-table.component.html',
  styleUrl: './tree-table.component.css',
})
export class TreeTableComponent<T = Record<string, unknown>> {
  protected readonly icons = injectSemiUIIcons();

  columns = input<readonly TreeTableColumn<T>[]>([]);
  nodes = input<readonly TreeNode<T>[]>([]);
  selectionMode = input<TreeTableSelectionMode>('none');
  /** The currently selected nodes. Two-way bindable. */
  selection = model<TreeNode<T>[]>([]);
  loading = input(false, { transform: booleanAttribute });
  striped = input(true, { transform: booleanAttribute });
  emptyMessage = input('No data available');

  /** Custom per-cell rendering. Context: `{ $implicit: value, node, column, value, level }`. Falls back to the raw field value as text. */
  protected cellTemplate = contentChild<unknown, TemplateRef<TreeTableCellContext<T>>>('cell', { read: TemplateRef });

  protected readonly expandedNodes = signal<ReadonlySet<TreeNode<T>>>(new Set());
  private hasSeededExpanded = false;

  /** Signal inputs aren't guaranteed to hold their bound value yet in the constructor -- seeded
   * once after the first render instead, same pattern as Accordion's `defaultOpenIndices`. */
  private readonly seedExpanded = afterRenderEffect(() => {
    if (this.hasSeededExpanded) {
      return;
    }
    this.hasSeededExpanded = true;
    const initial = new Set<TreeNode<T>>();
    const walk = (list: readonly TreeNode<T>[]) => {
      for (const node of list) {
        if (node.expanded) {
          initial.add(node);
        }
        if (node.children?.length) {
          walk(node.children);
        }
      }
    };
    walk(this.nodes());
    this.expandedNodes.set(initial);
  });

  protected readonly visibleRows = computed<VisibleRow<T>[]>(() => {
    const rows: VisibleRow<T>[] = [];
    const expanded = this.expandedNodes();
    const walk = (list: readonly TreeNode<T>[], level: number) => {
      for (const node of list) {
        rows.push({ node, level });
        if (node.children?.length && expanded.has(node)) {
          walk(node.children, level + 1);
        }
      }
    };
    walk(this.nodes(), 0);
    return rows;
  });

  protected hasChildren(node: TreeNode<T>): boolean {
    return !!node.children?.length;
  }

  protected isExpanded(node: TreeNode<T>): boolean {
    return this.expandedNodes().has(node);
  }

  protected toggleExpand(node: TreeNode<T>): void {
    this.expandedNodes.update((current) => {
      const next = new Set(current);
      if (next.has(node)) {
        next.delete(node);
      } else {
        next.add(node);
      }
      return next;
    });
  }

  protected isSelected(node: TreeNode<T>): boolean {
    return this.selection().includes(node);
  }

  protected toggleSelection(node: TreeNode<T>): void {
    if (this.selectionMode() === 'none') {
      return;
    }
    if (this.selectionMode() === 'single') {
      this.selection.set(this.isSelected(node) ? [] : [node]);
      return;
    }
    if (this.isSelected(node)) {
      this.selection.update((current) => current.filter((n) => n !== node));
    } else {
      this.selection.update((current) => [...current, node]);
    }
  }

  protected cellValue(node: TreeNode<T>, field: string): unknown {
    return (node.data as Record<string, unknown>)[field];
  }
}

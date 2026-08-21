import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  TemplateRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';

export interface OrgChartNode<T = { label: string }> {
  data: T;
  children?: OrgChartNode<T>[];
  /** Initial expanded state, read once on first render -- same convention as Tree Table's
   * `expanded`. After that, expansion is tracked entirely by this component. */
  expanded?: boolean;
}

export type OrgChartSelectionMode = 'none' | 'single' | 'multiple';

export interface OrgChartNodeContext<T> {
  $implicit: T;
  node: OrgChartNode<T>;
  expanded: boolean;
  selected: boolean;
}

/**
 * Renders one node and its subtree, recursively -- a child is just another
 * `OrganizationChartNodeComponent`, laid out beside its siblings under a shared connector line.
 * Imports itself via `forwardRef`, the same pattern Context Menu's own recursive submenu panel
 * uses, since a standalone component can't reference its own not-yet-initialized class in its own
 * `imports` array directly.
 *
 * The connector lines (drawn in `organization-chart.component.css`, shared with the wrapper) use
 * the classic ul/li CSS-tree technique adapted to these custom elements: every non-root node draws
 * half the horizontal bar to its siblings via `::before`/`::after` plus its own vertical drop, and
 * the shared `.s-organization-chart-node__children` container draws the single vertical drop down
 * from the parent. `inset-inline-*`/`border-inline-*` (not `left`/`right`) throughout, so the whole
 * layout mirrors correctly under RTL without any `:dir()` overrides.
 */
@Component({
  selector: 's-organization-chart-node',
  imports: [SIconComponent, NgTemplateOutlet, forwardRef(() => OrganizationChartNodeComponent)],
  templateUrl: './organization-chart-node.component.html',
  styleUrl: './organization-chart.component.css',
  host: {
    class: 's-organization-chart-node',
    '[attr.data-root]': "isRoot() ? '' : null",
  },
})
export class OrganizationChartNodeComponent<T = { label: string }> {
  protected readonly icons = injectSemiUIIcons();

  node = input.required<OrgChartNode<T>>();
  /** True only for the single node rendered directly by `OrganizationChartComponent` -- every
   * recursive child sets this to `false`, which is what suppresses its own incoming connector
   * line/padding (there's nothing for the root to connect up to). */
  isRoot = input(true, { transform: booleanAttribute });
  /** Whether any node in the tree shows an expand/collapse toggle at all. When `false`, every
   * node's subtree renders fully expanded with no toggle, regardless of its own `expanded` data. */
  collapsible = input(true, { transform: booleanAttribute });
  selectionMode = input<OrgChartSelectionMode>('none');
  selectedNodes = input<ReadonlySet<OrgChartNode<T>>>(new Set());
  nodeTemplate = input<TemplateRef<OrgChartNodeContext<T>> | null>(null);

  /** Bubbles up through every ancestor's own `(toggleSelect)="toggleSelect.emit($event)"` binding
   * to the root, which owns the actual selection model -- same forwarding pattern Context Menu's
   * recursive submenu uses for its `select` output. */
  toggleSelect = output<OrgChartNode<T>>();

  protected readonly expanded = signal(true);
  private hasSeededExpanded = false;

  /** Signal inputs aren't guaranteed to hold their bound value yet in the constructor -- seeded
   * once after the first render instead, same pattern as Tree Table's `seedExpanded`. */
  private readonly seedExpanded = afterRenderEffect(() => {
    if (this.hasSeededExpanded) {
      return;
    }
    this.hasSeededExpanded = true;
    this.expanded.set(this.node().expanded ?? true);
  });

  protected readonly hasChildren = computed(() => !!this.node().children?.length);
  protected readonly isSelected = computed(() => this.selectedNodes().has(this.node()));
  /** The state actually rendered -- when `collapsible` is off there's no toggle to ever collapse a
   * node again, so a subtree stuck behind `node.expanded: false` with no UI to reveal it would be a
   * dead end; folding that in here means the tree just always renders fully expanded instead. */
  protected readonly effectiveExpanded = computed(() => !this.collapsible() || this.expanded());

  /** Fallback rendering when no `#node` template is projected -- reads `data.label` without
   * requiring every consumer's `T` to structurally satisfy it at compile time, same reasoning as
   * Tree Table's `cellValue` reading through a plain `Record` cast. */
  protected readonly labelText = computed(() => {
    const data = this.node().data as Record<string, unknown>;
    return data['label'] != null ? String(data['label']) : '';
  });

  protected toggleExpand(event: Event): void {
    event.stopPropagation();
    this.expanded.update((value) => !value);
  }

  protected onSelect(): void {
    if (this.selectionMode() === 'none') {
      return;
    }
    this.toggleSelect.emit(this.node());
  }
}

/**
 * An org chart: pass a single root `node` (data plus optional `children`, recursively). Each node
 * renders as a card connected to its children by lines; clicking a node's toggle collapses its
 * subtree, clicking the node itself selects it (when `selectionMode` isn't `'none'`). The `#node`
 * template slot overrides how every node's content renders -- context is `{ $implicit: data, node,
 * expanded, selected }`.
 */
@Component({
  selector: 's-organization-chart',
  imports: [OrganizationChartNodeComponent],
  templateUrl: './organization-chart.component.html',
  styleUrl: './organization-chart.component.css',
  host: {
    class: 's-organization-chart',
  },
})
export class OrganizationChartComponent<T = { label: string }> {
  node = input.required<OrgChartNode<T>>();
  /** Whether any node in the tree shows an expand/collapse toggle at all. Default `true`; set
   * `false` for a tree that's always fully shown with no collapse affordance anywhere. */
  collapsible = input(true, { transform: booleanAttribute });
  selectionMode = input<OrgChartSelectionMode>('none');
  /** The currently selected nodes. Two-way bindable. */
  selection = model<OrgChartNode<T>[]>([]);

  protected readonly contentNodeTemplate = contentChild<unknown, TemplateRef<OrgChartNodeContext<T>>>('node', {
    read: TemplateRef,
  });

  protected readonly selectedSet = computed(() => new Set(this.selection()));

  protected onToggleSelect(node: OrgChartNode<T>): void {
    const mode = this.selectionMode();
    if (mode === 'none') {
      return;
    }
    if (mode === 'single') {
      this.selection.set(this.selection().includes(node) ? [] : [node]);
      return;
    }
    if (this.selection().includes(node)) {
      this.selection.update((current) => current.filter((n) => n !== node));
    } else {
      this.selection.update((current) => [...current, node]);
    }
  }
}

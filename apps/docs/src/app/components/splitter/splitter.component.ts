import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  afterRenderEffect,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';

export type SplitterOrientation = 'horizontal' | 'vertical';

/**
 * Marks an `<ng-template>` as one resizable panel of an `<s-splitter>`. Declared as a directive
 * (not a component) so the splitter itself owns rendering -- gutters need to be interleaved
 * *between* panels, which plain content projection can't do on its own, so the parent instead
 * collects these template refs via `contentChildren` and lays out `<ng-container>` + gutter pairs
 * itself, the same "gather templates, render structure in the parent" shape Table/Accordion/
 * Stepper's own `#content`-style slots use, just repeatable here instead of a single named slot.
 *
 * ```html
 * <s-splitter>
 *   <ng-template sSplitterPanel [size]="30" [minSize]="10">Left</ng-template>
 *   <ng-template sSplitterPanel [size]="70" [minSize]="20">Right</ng-template>
 * </s-splitter>
 * ```
 */
@Directive({
  selector: 'ng-template[sSplitterPanel]',
})
export class SplitterPanelDirective {
  readonly templateRef = inject(TemplateRef);

  /** Initial size, as a percentage of the splitter's main axis. Panels that omit it split
   * whatever percentage remains (100 minus every specified size) evenly among themselves. */
  size = input<number>();
  /** Minimum size, as a percentage -- dragging (or arrow-keying) an adjacent gutter won't shrink
   * this panel past it. */
  minSize = input(0);
}

/**
 * Resizable panes divided by a draggable gutter: pass panels as `<ng-template sSplitterPanel>`
 * children (see `SplitterPanelDirective`). Each panel's width (or height, when vertical) is
 * driven by `flex-grow` rather than a literal percentage `flex-basis` -- growth distributes
 * whatever space is left over *after* the gutters' own fixed pixel width is subtracted, so N
 * gutters at a few pixels each never pushes the total past 100% and overflows the container, the
 * way literal percentage widths summing to exactly 100% would.
 */
@Component({
  selector: 's-splitter',
  imports: [NgTemplateOutlet],
  templateUrl: './splitter.component.html',
  styleUrl: './splitter.component.css',
  host: {
    class: 's-splitter',
    '[attr.data-orientation]': 'orientation()',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'endDrag()',
    '(pointercancel)': 'endDrag()',
  },
})
export class SplitterComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  orientation = input<SplitterOrientation>('horizontal');

  protected readonly panels = contentChildren(SplitterPanelDirective);

  protected readonly sizes = signal<number[]>([]);
  private hasSeededSizes = false;
  private draggingGutter = signal<number | null>(null);
  private dragStartPos = 0;
  private dragStartSizes: number[] = [];

  /** Signal inputs/contentChildren aren't guaranteed populated yet in the constructor -- seeded
   * once after the first render instead, same pattern as Accordion's `defaultOpenIndices`. */
  private readonly seedSizes = afterRenderEffect(() => {
    const list = this.panels();
    if (list.length === 0 || this.hasSeededSizes) {
      return;
    }
    this.hasSeededSizes = true;
    const specified = list.map((p) => p.size());
    const specifiedTotal = specified.reduce<number>((sum, s) => sum + (s ?? 0), 0);
    const unspecifiedCount = specified.filter((s) => s === undefined).length;
    const share = unspecifiedCount > 0 ? Math.max(0, 100 - specifiedTotal) / unspecifiedCount : 0;
    this.sizes.set(specified.map((s) => s ?? share));
  });

  protected panelSize(index: number): number {
    return this.sizes()[index] ?? 0;
  }

  protected startDrag(event: PointerEvent, gutterIndex: number): void {
    event.preventDefault();
    this.draggingGutter.set(gutterIndex);
    this.dragStartPos = this.orientation() === 'horizontal' ? event.clientX : event.clientY;
    this.dragStartSizes = [...this.sizes()];
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    const index = this.draggingGutter();
    if (index === null) {
      return;
    }
    const rect = this.host.nativeElement.getBoundingClientRect();
    const totalSize = this.orientation() === 'horizontal' ? rect.width : rect.height;
    if (totalSize === 0) {
      return;
    }
    const currentPos = this.orientation() === 'horizontal' ? event.clientX : event.clientY;
    const deltaPercent = ((currentPos - this.dragStartPos) / totalSize) * 100;
    this.applyDelta(index, deltaPercent, this.dragStartSizes);
  }

  protected endDrag(): void {
    this.draggingGutter.set(null);
  }

  /** Arrow keys resize by a fixed step, same convention as Slider's own keyboard handling. */
  protected onGutterKeydown(event: KeyboardEvent, gutterIndex: number): void {
    const horizontal = this.orientation() === 'horizontal';
    const growKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const shrinkKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    if (event.key !== growKey && event.key !== shrinkKey) {
      return;
    }
    event.preventDefault();
    const step = event.key === growKey ? 2 : -2;
    this.applyDelta(gutterIndex, step, this.sizes());
  }

  /** Shared by drag and keyboard resize: grows/shrinks the gutter's two neighbor panels by
   * `deltaPercent` (taken from `baseSizes`, their sizes at the start of this gesture), clamped so
   * neither drops below its own `minSize`. */
  private applyDelta(gutterIndex: number, deltaPercent: number, baseSizes: readonly number[]): void {
    const panels = this.panels();
    const leftMin = panels[gutterIndex]?.minSize() ?? 0;
    const rightMin = panels[gutterIndex + 1]?.minSize() ?? 0;

    let newLeft = baseSizes[gutterIndex] + deltaPercent;
    let newRight = baseSizes[gutterIndex + 1] - deltaPercent;

    if (newLeft < leftMin) {
      newRight -= leftMin - newLeft;
      newLeft = leftMin;
    }
    if (newRight < rightMin) {
      newLeft -= rightMin - newRight;
      newRight = rightMin;
    }
    newLeft = Math.max(newLeft, leftMin);
    newRight = Math.max(newRight, rightMin);

    this.sizes.update((current) => {
      const next = [...current];
      next[gutterIndex] = newLeft;
      next[gutterIndex + 1] = newRight;
      return next;
    });
  }
}

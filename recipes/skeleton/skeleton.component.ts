import { Component, booleanAttribute, computed, input } from '@angular/core';

/** A loading placeholder block. Use `shape="text"` with `lines` for paragraph-style placeholders. */
@Component({
  selector: 'z-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
  host: {
    role: 'status',
    'aria-label': 'Loading',
    '[attr.data-shape]': 'shape()',
  },
})
export class SkeletonComponent {
  shape = input<'rect' | 'circle' | 'text'>('rect');
  width = input('100%');
  height = input('1rem');
  /** Number of lines when `shape="text"`. The last line renders shorter, like real paragraph text. */
  lines = input(3);
  animated = input(true, { transform: booleanAttribute });

  protected readonly lineIndices = computed(() => Array.from({ length: this.lines() }, (_, i) => i));
}

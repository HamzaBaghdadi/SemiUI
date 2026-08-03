import { Component, input } from '@angular/core';

/**
 * A horizontal or vertical rule. Any projected content (text, an icon) renders as a centered
 * label with the line continuing on both sides; with no content, it's just a plain line.
 */
@Component({
  selector: 's-divider',
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.css',
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class DividerComponent {
  orientation = input<'horizontal' | 'vertical'>('horizontal');
}

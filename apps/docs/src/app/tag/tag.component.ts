import { Component, booleanAttribute, input, output } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { IconRef, TagVariant } from '@semiui/tokens';
import { injectSemiUIIcons } from '@semiui/theme';

/** A small label/chip. Emits `removed` when its remove button is clicked, if `removable`. */
@Component({
  selector: 's-tag',
  imports: [SIconComponent],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css',
  host: {
    '[attr.data-variant]': 'variant()',
  },
})
export class TagComponent {
  protected readonly icons = injectSemiUIIcons();

  variant = input<TagVariant>('default');
  /** Optional leading icon. */
  icon = input<IconRef>();
  removable = input(false, { transform: booleanAttribute });

  removed = output<void>();

  protected onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.removed.emit();
  }
}

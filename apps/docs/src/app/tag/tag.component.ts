import { Component, booleanAttribute, input, output } from '@angular/core';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { IconRef, TagVariant } from '@zaytoon/tokens';
import { injectZaytoonIcons } from '@zaytoon/theme';

/** A small label/chip. Emits `removed` when its remove button is clicked, if `removable`. */
@Component({
  selector: 'z-tag',
  imports: [ZIconComponent],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css',
  host: {
    '[attr.data-variant]': 'variant()',
  },
})
export class TagComponent {
  protected readonly icons = injectZaytoonIcons();

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

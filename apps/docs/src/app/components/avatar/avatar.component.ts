import { Component, computed, input, signal } from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { injectSemiUIIcons } from '@semiui/theme';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

/**
 * Shows an image, falling back to initials derived from `name`, falling back to a generic
 * person icon if neither is available. Automatically falls back on image load failure too.
 */
@Component({
  selector: 's-avatar',
  imports: [SIconComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
  },
})
export class AvatarComponent {
  protected readonly icons = injectSemiUIIcons();

  src = input<string>();
  alt = input('');
  /** Used to derive initials (e.g. "Ada Lovelace" -> "AL") when there's no image. */
  name = input('');
  size = input<AvatarSize>('md');
  shape = input<'circle' | 'square'>('circle');
  status = input<AvatarStatus>();

  protected readonly imageFailed = signal(false);
  protected readonly showImage = computed(() => !!this.src() && !this.imageFailed());

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '';
    }
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}

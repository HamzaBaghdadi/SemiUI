import { Component, booleanAttribute, computed, input, output } from '@angular/core';
import { ButtonDirective } from '@zaytoon/primitives/button';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { ButtonSize, ButtonVariant, IconRef } from '@zaytoon/tokens';
import { injectZaytoonIcons } from '@zaytoon/theme';

@Component({
  selector: 'z-button',
  imports: [ButtonDirective, ZIconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-icon-only]': 'icon() ? \'\' : null',
    '[attr.data-outlined]': 'outlined() ? \'\' : null',
    '[attr.data-text]': 'text() ? \'\' : null',
  },
})
export class ButtonComponent {
  private icons = injectZaytoonIcons();

  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  /** Icon-only mode: hides the label and renders just `iconLeading`, sized to a perfect square. */
  icon = input(false, { transform: booleanAttribute });
  /** Transparent background, a border and text in the variant's color -- combines with any `variant` (e.g. `variant="success" [outlined]="true"`). */
  outlined = input(false, { transform: booleanAttribute });
  /** Transparent background, no border, text in the variant's color -- the old "ghost" style, now a modifier that combines with any `variant`. */
  text = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });
  iconLeading = input<IconRef>();
  iconTrailing = input<IconRef>();
  pressed = output<void>();

  protected isDisabled = computed(() => this.disabled() || this.loading());
  protected loadingIcon = computed<IconRef>(() => this.icons.loading);
  protected showLeadingIcon = computed(() => !this.loading() && !!this.iconLeading());
  protected showTrailingIcon = computed(() => !this.loading() && !this.icon() && !!this.iconTrailing());
}

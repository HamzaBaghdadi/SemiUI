import { Component, computed, input, output } from '@angular/core';
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
  },
})
export class ButtonComponent {
  private icons = injectZaytoonIcons();

  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input(false);
  loading = input(false);
  iconLeading = input<IconRef>();
  iconTrailing = input<IconRef>();
  pressed = output<void>();

  protected isDisabled = computed(() => this.disabled() || this.loading());
  protected loadingIcon = computed<IconRef>(() => this.icons.loading);
  protected showLeadingIcon = computed(() => !this.loading() && !!this.iconLeading());
  protected showTrailingIcon = computed(() => !this.loading() && !!this.iconTrailing());
}

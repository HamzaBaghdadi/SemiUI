import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideChevronDown,
  lucideMoon,
  lucidePalette,
  lucideSearch,
  lucideSun,
} from '@ng-icons/lucide';
import { Aurora } from '@semiui/presets-aurora';
import { Carbon } from '@semiui/presets-carbon';
import { Cupertino } from '@semiui/presets-cupertino';
import { Fluent } from '@semiui/presets-fluent';
import { Material } from '@semiui/presets-material';
import { Samsung } from '@semiui/presets-samsung';
import { Semi } from '@semiui/presets-semi';
import {
  ColorModeService,
  SEMIUI_COLOR_MODE_CONFIG,
  injectThemeStylesheet,
} from '@semiui/theme';
import { IconRef, ThemePreset } from '@semiui/tokens';
import { ButtonComponent } from '../../components/button/button.component';
import { PopoverComponent } from '../../components/popover/popover.component';
import { SelectComponent } from '../../components/select/select.component';
import { SwitchComponent } from '../../components/switch/switch.component';
import { TagComponent } from '../../components/tag/tag.component';
import { TooltipDirective } from '../../components/tooltip/tooltip.directive';
import { RtlService } from '../../services/rtl.service';
import { customizeIcon, githubIcon } from '../icons/main';

interface PresetOption {
  label: string;
  preset: ThemePreset;
}

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  imports: [
    ButtonComponent,
    TooltipDirective,
    TagComponent,
    RouterLink,
    RouterLinkActive,
    SwitchComponent,
    SelectComponent,
    PopoverComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    provideIcons({
      lucideSearch,
      lucideBell,
      lucideSun,
      lucideMoon,
      lucideChevronDown,
      lucidePalette,
    }),
  ],
})
export class TopbarComponent {
  protected readonly colorModeService = inject(ColorModeService);
  protected readonly rtlService = inject(RtlService);
  private readonly document = inject(DOCUMENT);
  private readonly colorModeConfig = inject(SEMIUI_COLOR_MODE_CONFIG);

  protected readonly menuItems = signal([
    { label: 'Home', link: '/home' },
    { label: 'Components', link: '/components' },
    { label: 'Installation', link: '/installation' },
    { label: 'Presets & Theming', link: '/theming' },
  ]);

  protected readonly rotateDeg = signal(0);
  // Icons
  protected readonly githubIcon: IconRef = githubIcon;
  protected readonly customizeIcon: IconRef = customizeIcon;

  protected readonly presetOptions: readonly PresetOption[] = [
    { label: 'Semi', preset: Semi },
    { label: 'Aurora', preset: Aurora },
    { label: 'Material', preset: Material },
    { label: 'Carbon', preset: Carbon },
    { label: 'Fluent', preset: Fluent },
    { label: 'Cupertino', preset: Cupertino },
    { label: 'Samsung', preset: Samsung },
  ];
  protected readonly selectedPresetOption = signal<PresetOption>(
    this.presetOptions[0],
  );

  protected onPresetChange(value: unknown): void {
    const option = value as PresetOption | null;
    if (!option) {
      return;
    }
    this.selectedPresetOption.set(option);
    injectThemeStylesheet(
      this.document,
      option.preset,
      this.colorModeConfig.darkClassName,
    );
  }

  protected rotateLogo() {
    this.rotateDeg.update((val) => val - 180);
  }

  protected openGithub(): void {
    window.open(
      'https://github.com/HamzaBaghdadi/SemiUI',
      '_blank',
      'noopener,noreferrer',
    );
  }
}

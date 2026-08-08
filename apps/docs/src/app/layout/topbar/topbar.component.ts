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
  protected readonly githubIcon: IconRef = {
    type: 'svg',
    markup:
      '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
  };

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

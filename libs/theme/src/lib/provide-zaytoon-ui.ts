import { DOCUMENT } from '@angular/common';
import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { ThemePreset } from '@zaytoon/tokens';
import { ColorModeConfig, DEFAULT_COLOR_MODE_CONFIG, ZAYTOON_COLOR_MODE_CONFIG } from './color-mode.config';
import { ColorModeService } from './color-mode.service';
import { injectThemeStylesheet } from './theme-stylesheet';
import { ZAYTOON_ICONS } from './icon-tokens.token';
import { ZAYTOON_THEME_PRESET } from './theme-preset.token';

export interface ZaytoonUIConfig {
  preset: ThemePreset;
  /** Storage key / dark-mode class name used by `ColorModeService`. Both default if omitted. */
  colorMode?: Partial<ColorModeConfig>;
}

/**
 * Registers a theme preset: injects its tokens as a stylesheet (`:root` + the dark-mode class),
 * registers its default icons, and installs `ColorModeService` so light/dark mode works out of
 * the box.
 */
export function provideZaytoonUI(config: ZaytoonUIConfig): EnvironmentProviders {
  const colorModeConfig: ColorModeConfig = { ...DEFAULT_COLOR_MODE_CONFIG, ...config.colorMode };

  return makeEnvironmentProviders([
    { provide: ZAYTOON_THEME_PRESET, useValue: config.preset },
    { provide: ZAYTOON_ICONS, useValue: config.preset.icons },
    { provide: ZAYTOON_COLOR_MODE_CONFIG, useValue: colorModeConfig },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const document = inject(DOCUMENT);
        const preset = inject(ZAYTOON_THEME_PRESET);
        const { darkClassName } = inject(ZAYTOON_COLOR_MODE_CONFIG);
        injectThemeStylesheet(document, preset, darkClassName);
        inject(ColorModeService); // eagerly construct so its effect applies the dark class immediately
      },
    },
  ]);
}

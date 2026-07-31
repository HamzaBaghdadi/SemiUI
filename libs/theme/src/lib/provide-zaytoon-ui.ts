import { DOCUMENT } from '@angular/common';
import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { ThemePreset } from '@zaytoon/tokens';
import { applyThemeTokens } from './apply-theme-tokens';
import { ZAYTOON_ICONS } from './icon-tokens.token';
import { ZAYTOON_THEME_PRESET } from './theme-preset.token';

export interface ZaytoonUIConfig {
  preset: ThemePreset;
}

/** Registers a theme preset: applies its design tokens as CSS custom properties on `<html>` and its default icons via DI. */
export function provideZaytoonUI(config: ZaytoonUIConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ZAYTOON_THEME_PRESET, useValue: config.preset },
    { provide: ZAYTOON_ICONS, useValue: config.preset.icons },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const document = inject(DOCUMENT);
        const preset = inject(ZAYTOON_THEME_PRESET);
        applyThemeTokens(document.documentElement, preset.tokens);
      },
    },
  ]);
}

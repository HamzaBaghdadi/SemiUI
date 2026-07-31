import { InjectionToken } from '@angular/core';

export interface ColorModeConfig {
  /** localStorage key the resolved mode is persisted under. */
  storageKey: string;
  /** Class name toggled on `<html>` when dark mode is active (e.g. 'dark', 'dark-mode'). */
  darkClassName: string;
}

export const DEFAULT_COLOR_MODE_CONFIG: ColorModeConfig = {
  storageKey: 'zaytoon-color-mode',
  darkClassName: 'dark',
};

export const ZAYTOON_COLOR_MODE_CONFIG = new InjectionToken<ColorModeConfig>('ZAYTOON_COLOR_MODE_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_COLOR_MODE_CONFIG,
});

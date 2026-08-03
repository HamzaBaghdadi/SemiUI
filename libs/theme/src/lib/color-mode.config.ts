import { InjectionToken } from '@angular/core';

export interface ColorModeConfig {
  /** localStorage key the resolved mode is persisted under. */
  storageKey: string;
  /** Class name toggled on `<html>` when dark mode is active (e.g. 'dark', 'dark-mode'). */
  darkClassName: string;
}

export const DEFAULT_COLOR_MODE_CONFIG: ColorModeConfig = {
  storageKey: 'semiui-color-mode',
  darkClassName: 'dark',
};

export const SEMIUI_COLOR_MODE_CONFIG = new InjectionToken<ColorModeConfig>('SEMIUI_COLOR_MODE_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_COLOR_MODE_CONFIG,
});

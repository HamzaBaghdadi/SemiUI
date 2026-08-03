import { inject, InjectionToken } from '@angular/core';
import { IconTokens } from '@semiui/tokens';

export const SEMIUI_ICONS = new InjectionToken<IconTokens>('SEMIUI_ICONS');

/** Reads the active preset's default icons (e.g. a button's loading spinner). */
export function injectSemiUIIcons(): IconTokens {
  return inject(SEMIUI_ICONS);
}

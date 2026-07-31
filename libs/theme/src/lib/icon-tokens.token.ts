import { inject, InjectionToken } from '@angular/core';
import { IconTokens } from '@zaytoon/tokens';

export const ZAYTOON_ICONS = new InjectionToken<IconTokens>('ZAYTOON_ICONS');

/** Reads the active preset's default icons (e.g. a button's loading spinner). */
export function injectZaytoonIcons(): IconTokens {
  return inject(ZAYTOON_ICONS);
}

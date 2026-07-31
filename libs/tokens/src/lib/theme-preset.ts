import { ColorTokens, ThemeTokens } from './theme-tokens';
import { IconTokens } from './icon-tokens';

export interface ThemePreset {
  name: string;
  /** Base tokens, applied to `:root`. `tokens.color` doubles as the light-mode palette. */
  tokens: ThemeTokens;
  /** Dark-mode palette override, applied under the configured dark-mode selector. */
  darkColor: ColorTokens;
  icons: IconTokens;
}

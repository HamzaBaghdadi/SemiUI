import { IconTokens } from './icon-tokens';
import { ThemeTokens } from './theme-tokens';

export interface ThemePreset {
  name: string;
  tokens: ThemeTokens;
  icons: IconTokens;
}

import { ThemeTokens, flattenTokensToCssVars } from '@zaytoon/tokens';

export function applyThemeTokens(target: HTMLElement, tokens: ThemeTokens): void {
  const vars = flattenTokensToCssVars(tokens as unknown as Record<string, unknown>);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
}

import { ThemePreset, flattenTokensToCssVars } from '@semiui/tokens';

const STYLE_ELEMENT_ID = 'semiui-theme';

function toDeclarationBlock(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
}

/**
 * Builds the theme stylesheet text: base tokens (including the light-mode palette) on `:root`,
 * and the dark-mode palette override scoped under `.{darkClassName}` so the cascade -- not JS --
 * handles switching, and inline styles never fight the toggled class.
 */
export function renderThemeStylesheet(preset: ThemePreset, darkClassName: string): string {
  const baseVars = flattenTokensToCssVars(preset.tokens as unknown as Record<string, unknown>);
  const darkVars = flattenTokensToCssVars({ color: preset.darkColor } as unknown as Record<string, unknown>);

  return `:root {\n${toDeclarationBlock(baseVars)}\n}\n\n.${darkClassName} {\n${toDeclarationBlock(darkVars)}\n}`;
}

/** Injects (or updates) the `<style>` element carrying the active preset's CSS custom properties. */
export function injectThemeStylesheet(document: Document, preset: ThemePreset, darkClassName: string): void {
  const cssText = renderThemeStylesheet(preset, darkClassName);
  let styleElement = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = STYLE_ELEMENT_ID;
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = cssText;
}

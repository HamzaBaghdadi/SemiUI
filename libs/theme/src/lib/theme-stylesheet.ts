import { ThemePreset, buildThemeVars, toDeclarationBlock } from '@semiui/tokens';

const STYLE_ELEMENT_ID = 'semiui-theme';

/**
 * Compiles a preset to its stylesheet: everything it declares on `:root`, and only what dark mode
 * actually changes scoped under `.{darkClassName}`, so the cascade -- not JS -- handles switching
 * and inline styles never fight the toggled class.
 *
 * Which variables exist, what they're called, and how `{token.path}` references become `var()`
 * references is entirely `buildThemeVars`' business (see `@semiui/tokens`); this function only
 * decides which selector each set lands on.
 */
export function renderThemeStylesheet(preset: ThemePreset, darkClassName: string): string {
  const { root, dark } = buildThemeVars(preset);

  const rootRule = `:root {\n${toDeclarationBlock(root)}\n}`;
  if (Object.keys(dark).length === 0) {
    return rootRule;
  }
  return `${rootRule}\n\n.${darkClassName} {\n${toDeclarationBlock(dark)}\n}`;
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

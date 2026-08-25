import { cssVarRef, flattenPreset } from '@semiui/tokens';
import { TailwindThemeEntry, TailwindThemeOptions, buildTailwindTheme } from './tailwind-theme';

/**
 * The shape of a Tailwind plugin, declared structurally so this package doesn't need a hard
 * dependency on `tailwindcss` just to describe its own return type.
 */
export interface TailwindPluginApi {
  addUtilities(utilities: Record<string, Record<string, string>>): void;
}

export interface TailwindPlugin {
  handler: (api: TailwindPluginApi) => void;
  config: { theme: { extend: Record<string, Record<string, string>> } };
}

/** Bare utilities that a named theme scale can't produce, keyed by the token path they render. */
const BARE_UTILITIES: ReadonlyArray<{ selector: string; property: string; tokenPath: string }> = [
  { selector: '.rounded-border', property: 'border-radius', tokenPath: 'radius.md' },
  { selector: '.border-surface', property: 'border-color', tokenPath: 'border' },
];

/**
 * Maps a Tailwind v4 theme namespace onto the config key a plugin declares it under.
 *
 * Longest prefix first: `--font-weight-medium` is a `fontWeight`, not a `fontFamily` named
 * `weight-medium`.
 */
const NAMESPACE_TO_CONFIG_KEY: ReadonlyArray<readonly [prefix: string, configKey: string]> = [
  ['--font-weight-', 'fontWeight'],
  ['--color-', 'colors'],
  ['--spacing-', 'spacing'],
  ['--radius-', 'borderRadius'],
  ['--text-', 'fontSize'],
  ['--leading-', 'lineHeight'],
  ['--tracking-', 'letterSpacing'],
  ['--font-', 'fontFamily'],
];

function toConfigEntry(entry: TailwindThemeEntry): readonly [string, string] | null {
  for (const [prefix, configKey] of NAMESPACE_TO_CONFIG_KEY) {
    if (entry.name.startsWith(prefix)) {
      return [configKey, entry.name.slice(prefix.length)];
    }
  }
  return null;
}

/**
 * Tailwind plugin that hands Tailwind a theme derived from a SemiUI preset.
 *
 * ```js
 * // tailwind.config.js -- referenced from CSS with `@config "./tailwind.config.js"`
 * import { semiuiTailwind } from '@semiui/tailwind';
 * import { Semi } from '@semiui/presets-semi';
 *
 * export default { plugins: [semiuiTailwind({ preset: Semi })] };
 * ```
 *
 * The theme comes from `buildTailwindTheme` -- the same generator behind
 * `renderTailwindThemeCss` -- so the two entry points can never disagree, and neither holds a list
 * of colors or a `--semiui-*` string.
 *
 * Projects on Tailwind v4's CSS-first workflow (`@import 'tailwindcss'` with no JS config, which
 * is what SemiUI's own apps use) want `renderTailwindThemeCss` instead: a JS config is only
 * reachable through `@config`, whereas the generated CSS is a plain `@import`.
 */
export function semiuiTailwind(options: TailwindThemeOptions): TailwindPlugin {
  const entries = buildTailwindTheme(options);
  const { index } = flattenPreset(options.preset);

  const extend: Record<string, Record<string, string>> = {};
  for (const entry of entries) {
    const configEntry = toConfigEntry(entry);
    if (!configEntry) {
      continue;
    }
    const [configKey, name] = configEntry;
    (extend[configKey] ??= {})[name] = entry.value;
  }

  const utilities: Record<string, Record<string, string>> = {};
  for (const { selector, property, tokenPath } of BARE_UTILITIES) {
    const target = index.get(tokenPath);
    if (target) {
      utilities[selector] = { [property]: cssVarRef(target.cssVar) };
    }
  }

  return {
    handler: (api) => api.addUtilities(utilities),
    config: { theme: { extend } },
  };
}

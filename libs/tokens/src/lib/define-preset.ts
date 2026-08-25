import { DeepPartial, PresetOverrides, ThemeOverrides, ThemePreset } from './token-types';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Merges `overrides` into `base` recursively, returning a new tree and mutating neither.
 *
 * Objects merge key-by-key at every depth -- overriding `semantic.primary` leaves the other
 * ~20 semantic colors alone, and overriding `components.button.variants.primary.background`
 * leaves the rest of the button untouched. String (and any other non-object) values replace
 * wholesale. `undefined` in an override means "not specified", so it never erases a base value;
 * that's what makes `DeepPartial` overrides safe to spell out with optional properties.
 *
 * This is deliberately not object spreading: `{ ...base, ...overrides }` at any level would drop
 * every sibling key of whatever the override touched.
 */
export function deepMergeTokens<T>(base: T, overrides: DeepPartial<T> | undefined): T {
  if (overrides === undefined) {
    return base;
  }
  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return overrides as T;
  }

  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      continue;
    }
    merged[key] = key in base ? deepMergeTokens(base[key], value as never) : value;
  }
  return merged as T;
}

/**
 * Builds a new preset from an existing one plus a set of overrides -- SemiUI's preset composition
 * primitive.
 *
 * Because component tokens reference semantic tokens and semantic tokens reference primitives,
 * an override at any layer propagates to everything downstream of it. Repointing `primary` at a
 * different scale re-colors every component that reads `{primary}` -- button, tag, badge, focus
 * rings, checked checkboxes, the slider fill, the active tab indicator, and so on -- with no
 * per-component overrides:
 *
 * ```ts
 * const MyTheme = definePreset(Semi, {
 *   primitive: { violet: { 500: '#8b5cf6' } },
 *   semantic: { primary: '{violet.500}' },
 * });
 * ```
 *
 * Overrides compose, so a preset can be derived from a derived preset. `name` defaults to the
 * base's name suffixed with `-derived` when the override doesn't supply one, so two presets in
 * the same app never silently share an identity.
 */
export function definePreset(base: ThemePreset, overrides: PresetOverrides = {}): ThemePreset {
  const { name, icons, dark, ...tokenLayers } = overrides;

  const merged: ThemePreset = deepMergeTokens<ThemePreset>(base, tokenLayers as DeepPartial<ThemePreset>);

  return {
    ...merged,
    name: name ?? `${base.name}-derived`,
    dark: dark ? deepMergeTokens<ThemeOverrides>(base.dark ?? {}, dark) : base.dark,
    icons: icons ? { ...base.icons, ...icons } : base.icons,
  };
}


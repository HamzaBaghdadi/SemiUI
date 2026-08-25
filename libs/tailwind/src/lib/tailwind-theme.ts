import {
  FlatToken,
  ThemePreset,
  TokenGroup,
  camelToKebab,
  cssVarRef,
  flattenPreset,
} from '@semiui/tokens';

/**
 * One Tailwind theme variable, derived from one SemiUI token.
 *
 * `value` is always a `var()` pointing at the token's own generated custom property -- never a
 * literal color. That indirection is the whole point: the utility class compiles once, and the
 * value it resolves to follows whichever preset and color mode are live at runtime.
 */
export interface TailwindThemeEntry {
  /** The Tailwind theme variable, e.g. `--color-primary`, `--radius-md`. */
  name: string;
  /** `var(--semiui-...)`, from the token engine. */
  value: string;
  /** The SemiUI token this came from, e.g. `primary`, `palette.primary.500`, `spacing.md`. */
  tokenPath: string;
  group: TokenGroup;
}

export interface TailwindThemeOptions {
  /** The preset to derive the theme from. The one source of truth. */
  preset: ThemePreset;
  /**
   * Namespace applied to the scales whose bare names collide with Tailwind's own (see below).
   * `'semiui'` (the default) produces `p-semiui-md` / `text-semiui-sm`; `null` produces `p-md` /
   * `text-sm`, claiming those names from Tailwind.
   *
   * The default is not timidity. Tailwind v4's `--spacing-*` namespace is a fallback for far more
   * than padding and margin: `max-w-*`, `w-*`, `h-*` and `min-w-*` all resolve named keys through
   * it. Defining a bare `--spacing-xl` silently rewrites `max-w-xl` from 36rem to SemiUI's 1.5rem
   * -- verified against Tailwind 4.3.3 -- which breaks layout in any app that already used those
   * utilities. Typography is namespaced for the same reason: claiming `--text-sm` and
   * `--font-weight-medium` reaches every piece of prose in the host app, not just SemiUI's
   * components.
   *
   * Colors and radius are deliberately *not* namespaced. `bg-primary` and `rounded-md` following
   * the active preset is the entire point of the integration, and neither namespace is a fallback
   * for unrelated utilities the way `--spacing-*` is.
   */
  scaleNamespace?: string | null;
  /** Token groups to expose. Component tokens are never exposed and cannot be added here. */
  include?: readonly PublicTokenGroup[];
}

/** The token groups that can become part of a Tailwind theme. Component tokens are not among them. */
export type PublicTokenGroup = Exclude<TokenGroup, 'component'>;

const DEFAULT_GROUPS: readonly PublicTokenGroup[] = [
  'primitive',
  'color',
  'palette',
  'spacing',
  'radius',
  'typography',
];

const DEFAULT_SCALE_NAMESPACE = 'semiui';

/**
 * Extra Tailwind color names that are conventional in themed component libraries but aren't a
 * plain one-to-one rename of a token. Written as *token paths*, never as CSS variable names, so
 * the engine still owns the mapping to `--semiui-*`. An entry is skipped when the preset doesn't
 * define that token.
 */
const COLOR_COMPAT_ALIASES: Readonly<Record<string, string>> = {
  'primary-contrast': 'primaryForeground',
  'primary-emphasis': 'palette.primary.600',
};

function namespaced(namespace: string | null | undefined, name: string): string {
  return namespace ? `${namespace}-${name}` : name;
}

/** `['typography','fontSize','sm'] -> '--text-<ns->sm'` and friends. */
function typographyVariable(segments: readonly string[], namespace: string | null | undefined): string | null {
  const [, kind, ...rest] = segments;
  const suffix = rest.map(camelToKebab).join('-');

  switch (kind) {
    case 'fontFamily':
      // A font *family* has no sub-key, so the namespace alone names it: `font-semiui`.
      return `--font-${namespace ?? 'sans'}${suffix ? `-${suffix}` : ''}`;
    case 'fontSize':
      return suffix ? `--text-${namespaced(namespace, suffix)}` : null;
    case 'fontWeight':
      return suffix ? `--font-weight-${namespaced(namespace, suffix)}` : null;
    case 'lineHeight':
      return suffix ? `--leading-${namespaced(namespace, suffix)}` : null;
    case 'letterSpacing':
      return suffix ? `--tracking-${namespaced(namespace, suffix)}` : null;
    default:
      return null;
  }
}

/**
 * Maps one flattened SemiUI token onto its Tailwind theme variable, or `null` when the token has
 * no sensible Tailwind equivalent.
 */
function tailwindVariable(token: FlatToken, namespace: string | null | undefined): string | null {
  const segments = token.path.split('.').map(camelToKebab);

  switch (token.group) {
    // Primitive ramps become plain Tailwind colors: `blue.500` -> `bg-blue-500`.
    case 'primitive':
      return `--color-${segments.join('-')}`;
    // Semantic colors keep their own names: `primary` -> `bg-primary`, `mutedForeground` ->
    // `text-muted-foreground`. Aliases come through here too, since the preset models them as
    // ordinary semantic colors that happen to reference another one.
    case 'color':
      return `--color-${segments.join('-')}`;
    // `palette.primary.500` -> `bg-primary-500`, sitting alongside the flat `bg-primary`.
    case 'palette':
      return `--color-${segments.slice(1).join('-')}`;
    case 'spacing':
      return `--spacing-${namespaced(namespace, segments.slice(1).join('-'))}`;
    case 'radius':
      return `--radius-${segments.slice(1).join('-')}`;
    case 'typography':
      return typographyVariable(token.path.split('.'), namespace);
    default:
      return null;
  }
}

/**
 * Derives a Tailwind theme from a SemiUI preset.
 *
 * Everything here is computed by walking the preset's own token tree and asking the token engine
 * for each token's generated variable name. There is no list of colors in this package, and no
 * `--semiui-*` string written by hand -- add a semantic token to a preset and it shows up as a
 * Tailwind utility with no change here.
 */
export function buildTailwindTheme(options: TailwindThemeOptions): TailwindThemeEntry[] {
  const { preset, scaleNamespace = DEFAULT_SCALE_NAMESPACE, include = DEFAULT_GROUPS } = options;
  const groups = new Set<TokenGroup>(include);
  groups.delete('component');

  const { tokens, index } = flattenPreset(preset);
  const entries: TailwindThemeEntry[] = [];
  const seen = new Map<string, TailwindThemeEntry>();

  const add = (entry: TailwindThemeEntry): void => {
    const existing = seen.get(entry.name);
    if (existing) {
      // Later groups win, and the ordering below puts semantic tokens after primitives -- so a
      // preset with a primitive literally named `primary` doesn't shadow the semantic one.
      entries.splice(entries.indexOf(existing), 1);
    }
    seen.set(entry.name, entry);
    entries.push(entry);
  };

  // Primitives first, then everything else, so the precedence note above holds.
  const ordered = [...tokens].sort((a, b) => Number(b.group === 'primitive') - Number(a.group === 'primitive'));

  for (const token of ordered) {
    if (!groups.has(token.group)) {
      continue;
    }
    const name = tailwindVariable(token, scaleNamespace);
    if (!name) {
      continue;
    }
    add({ name, value: cssVarRef(token.cssVar), tokenPath: token.path, group: token.group });
  }

  if (groups.has('color')) {
    for (const [alias, tokenPath] of Object.entries(COLOR_COMPAT_ALIASES)) {
      const target = index.get(tokenPath);
      if (target) {
        add({
          name: `--color-${alias}`,
          value: cssVarRef(target.cssVar),
          tokenPath,
          group: target.group,
        });
      }
    }
  }

  return entries;
}

/** The same theme as a plain `{ '--color-primary': 'var(--semiui-color-primary)' }` map. */
export function buildTailwindThemeMap(options: TailwindThemeOptions): Record<string, string> {
  return Object.fromEntries(buildTailwindTheme(options).map((entry) => [entry.name, entry.value]));
}

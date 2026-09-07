/**
 * The one place in SemiUI that knows what a generated CSS custom property is called.
 *
 * Presets never construct these names -- they author token paths and `{references}`, and the
 * engine maps a path onto a variable name here. Changing a convention below changes it everywhere
 * at once, and no preset needs touching.
 */

/** Which token layer a path belongs to. Determines the variable namespace. */
export type TokenLayer = 'primitive' | 'semantic' | 'components';

/**
 * What a token *is*, as opposed to which layer it was authored in. This is the classification any
 * downstream consumer should branch on -- notably `@semiui/tailwind`, which needs to know that
 * `spacing.md` is a length and `primary` is a color without re-deriving that from path shapes.
 *
 * Deriving it here rather than in each consumer keeps one authority over the token vocabulary: add
 * a semantic group to `SEMANTIC_NAMESPACES` below and every consumer classifies it correctly.
 */
export type TokenGroup =
  /** A raw value in the primitive layer -- `blue.500`, `white`, `night.base`. */
  | 'primitive'
  /** A semantic color -- `primary`, `mutedForeground`, `danger`. */
  | 'color'
  /** A shade of a semantic ramp -- `palette.primary.500`. */
  | 'palette'
  | 'spacing'
  | 'radius'
  | 'typography'
  /** A state opacity -- `opacity.disabled`. Its own group because it is neither a color nor a
   * length: it is the dimming a component applies to itself in a given state. */
  | 'opacity'
  /** A per-component token -- `components.button.radius`. Not part of any public theme surface. */
  | 'component';

export const CSS_VAR_PREFIX = 'semiui';

export function camelToKebab(segment: string): string {
  return segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Semantic groups that generate their own top-level namespace rather than landing under `color`.
 * Everything else at the top level of `semantic` is a color, so `primary` becomes
 * `--semiui-color-primary` without needing to be listed anywhere.
 */
const SEMANTIC_NAMESPACES: Record<string, string> = {
  palette: 'color-palette',
  spacing: 'spacing',
  radius: 'radius',
  typography: 'typography',
  opacity: 'opacity',
};

/**
 * Maps an authored token path onto its generated CSS custom property.
 *
 *     primitive  blue.500                            --semiui-primitive-blue-500
 *     semantic   primary                             --semiui-color-primary
 *     semantic   primaryForeground                   --semiui-color-primary-foreground
 *     semantic   palette.primary.500                 --semiui-color-palette-primary-500
 *     semantic   spacing.md                          --semiui-spacing-md
 *     semantic   opacity.disabled                    --semiui-opacity-disabled
 *     semantic   typography.fontSize.sm              --semiui-typography-font-size-sm
 *     components button.variants.primary.background  --semiui-comp-button-variants-primary-background
 */
export function tokenPathToCssVar(layer: TokenLayer, path: readonly string[]): string {
  const segments = path.map(camelToKebab);

  if (layer === 'primitive') {
    return `--${CSS_VAR_PREFIX}-primitive-${segments.join('-')}`;
  }
  if (layer === 'components') {
    return `--${CSS_VAR_PREFIX}-comp-${segments.join('-')}`;
  }

  const namespace = SEMANTIC_NAMESPACES[path[0]];
  if (namespace) {
    return `--${CSS_VAR_PREFIX}-${namespace}-${segments.slice(1).join('-')}`;
  }
  return `--${CSS_VAR_PREFIX}-color-${segments.join('-')}`;
}

/**
 * Classifies a token by what it represents. Mirrors `tokenPathToCssVar`'s own branching, so the
 * two can never disagree about which namespace a path belongs to.
 */
export function tokenGroup(layer: TokenLayer, path: readonly string[]): TokenGroup {
  if (layer === 'primitive') {
    return 'primitive';
  }
  if (layer === 'components') {
    return 'component';
  }
  switch (SEMANTIC_NAMESPACES[path[0]]) {
    case 'color-palette':
      return 'palette';
    case 'spacing':
      return 'spacing';
    case 'radius':
      return 'radius';
    case 'typography':
      return 'typography';
    case 'opacity':
      return 'opacity';
    default:
      return 'color';
  }
}

/** Wraps a generated variable name as a CSS `var()` reference. */
export function cssVarRef(name: string): string {
  return `var(${name})`;
}

/** Renders a variable map as the body of a CSS rule, one indented declaration per line. */
export function toDeclarationBlock(vars: Record<string, string>, indent = '  '): string {
  return Object.entries(vars)
    .map(([name, value]) => `${indent}${name}: ${value};`)
    .join('\n');
}

import { TokenGroup, TokenLayer, cssVarRef, tokenGroup, tokenPathToCssVar } from './css-vars';
import { deepMergeTokens } from './define-preset';
import {
  CircularTokenReferenceError,
  MissingTokenReferenceError,
  parseTokenRefs,
  replaceTokenRefs,
  suggestTokenPaths,
  wholeTokenRefPath,
} from './token-ref';
import { ThemeOverrides, ThemePreset, TokenTree, TokenValue } from './token-types';

/** One flattened token: where it was authored, what it's called in CSS, what it was set to. */
export interface FlatToken {
  /** The authored path, dot-separated -- `blue.500`, `primary`, `components.button.radius`. */
  path: string;
  layer: TokenLayer;
  /** What the token represents (color, spacing, component token, ...), per `tokenGroup`. This is
   * what downstream consumers such as the Tailwind bridge branch on. */
  group: TokenGroup;
  /** The generated CSS custom property, e.g. `--semiui-color-primary`. */
  cssVar: string;
  /** The value exactly as authored, references included. */
  value: TokenValue;
}

/** A preset compiled down to CSS custom properties, split by the selector each set belongs to. */
export interface ThemeVars {
  /** Everything the light/default theme declares, for `:root`. */
  root: Record<string, string>;
  /** Only what dark mode actually changes, for the dark-mode selector. */
  dark: Record<string, string>;
}

function isTree(value: unknown): value is TokenTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function joinPath(prefix: string, key: string): string {
  return prefix ? `${prefix}.${key}` : key;
}

// ---------------------------------------------------------------------------------------------
// Flattening
// ---------------------------------------------------------------------------------------------

/**
 * Walks one token layer, emitting a `FlatToken` per leaf.
 *
 * `trees` collects every intermediate node too, so a whole-object reference (`palette.primary:
 * '{blue}'`) can find the subtree it points at and expand it shade by shade. That expansion has to
 * happen here rather than at resolution time, because each expanded shade needs its own CSS
 * variable, not just a value.
 */
function flattenLayer(
  layer: TokenLayer,
  tree: TokenTree,
  pathPrefix: string,
  varPath: readonly string[],
  out: FlatToken[],
  trees: Map<string, TokenTree>,
): void {
  for (const [key, value] of Object.entries(tree)) {
    if (value === undefined || value === null) {
      continue;
    }
    const path = joinPath(pathPrefix, key);
    const nextVarPath = [...varPath, key];

    if (isTree(value)) {
      trees.set(path, value);
      flattenLayer(layer, value, path, nextVarPath, out, trees);
    } else if (typeof value === 'string') {
      out.push({
        path,
        layer,
        group: tokenGroup(layer, nextVarPath),
        cssVar: tokenPathToCssVar(layer, nextVarPath),
        value,
      });
    }
  }
}

/**
 * Expands leaves whose value is a whole-object reference (`'{blue}'` where `blue` is a scale) into
 * one leaf per member of the referenced subtree, each pointing at the corresponding source path.
 * So `palette.primary: '{blue}'` becomes `palette.primary.50: '{blue.50}'` .. `.950: '{blue.950}'`,
 * and each of those then resolves like any ordinary reference.
 *
 * Runs to a fixed point so a scale reference can itself point at another scale reference.
 */
function expandObjectRefs(tokens: FlatToken[], trees: Map<string, TokenTree>): FlatToken[] {
  const MAX_PASSES = 10;
  let current = tokens;

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let expandedAny = false;
    const next: FlatToken[] = [];

    for (const token of current) {
      const refPath = wholeTokenRefPath(token.value);
      const subtree = refPath ? trees.get(refPath) : undefined;
      if (!refPath || !subtree) {
        next.push(token);
        continue;
      }

      expandedAny = true;
      const varPath = token.path.split('.');
      const nested: FlatToken[] = [];
      const nestedTrees = new Map<string, TokenTree>();
      flattenLayer(token.layer, subtree, refPath, varPath, nested, nestedTrees);
      for (const [nestedPath, nestedTree] of nestedTrees) {
        trees.set(nestedPath, nestedTree);
      }

      for (const leaf of nested) {
        // `leaf.path` is the path *inside the source subtree*; the expanded token keeps the
        // referencing path (so its CSS variable stays in the referencing namespace) but takes its
        // value from the source, preserving the token relationship rather than copying the value.
        const relative = leaf.path.slice(refPath.length + 1);
        next.push({
          path: joinPath(token.path, relative),
          layer: token.layer,
          group: leaf.group,
          cssVar: leaf.cssVar,
          value: `{${leaf.path}}`,
        });
      }
    }

    current = next;
    if (!expandedAny) {
      return current;
    }
  }

  return current;
}

/**
 * Flattens a whole preset into its tokens plus the lookup index references resolve against.
 *
 * Lookup precedence, highest first: semantic, primitive, then component tokens (only reachable
 * under an explicit `components.` prefix, so a component token can never shadow a semantic one).
 * Each layer is also reachable under its own explicit prefix -- `{primitive.blue.500}`,
 * `{semantic.primary}` -- for the rare case where a preset defines the same name in two layers and
 * needs to disambiguate.
 */
export function flattenPreset(preset: ThemePreset): { tokens: FlatToken[]; index: Map<string, FlatToken> } {
  const tokens: FlatToken[] = [];
  const trees = new Map<string, TokenTree>();

  flattenLayer('primitive', preset.primitive as TokenTree, '', [], tokens, trees);
  flattenLayer('semantic', preset.semantic as unknown as TokenTree, '', [], tokens, trees);

  flattenLayer('components', preset.components as unknown as TokenTree, 'components', [], tokens, trees);

  const expanded = expandObjectRefs(tokens, trees);

  const index = new Map<string, FlatToken>();
  // Registered lowest-precedence first, so a later `set` on the same key wins.
  for (const token of expanded) {
    if (token.layer === 'components') {
      index.set(token.path, token);
    }
  }
  for (const token of expanded) {
    if (token.layer === 'primitive') {
      index.set(`primitive.${token.path}`, token);
      index.set(token.path, token);
    }
  }
  for (const token of expanded) {
    if (token.layer === 'semantic') {
      index.set(`semantic.${token.path}`, token);
      index.set(token.path, token);
    }
  }

  return { tokens: expanded, index };
}

// ---------------------------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------------------------

function lookup(index: Map<string, FlatToken>, reference: string, ownerPath: string): FlatToken {
  const target = index.get(reference);
  if (!target) {
    throw new MissingTokenReferenceError(reference, ownerPath, suggestTokenPaths(reference, index.keys()));
  }
  return target;
}

/**
 * Rewrites a token's authored value into its final CSS, turning each `{reference}` into a `var()`
 * pointing at the referenced token's own custom property.
 *
 * References stay references: `primary: '{blue.500}'` generates
 * `--semiui-color-primary: var(--semiui-primitive-blue-500)`, not a copy of the hex. That
 * indirection is what makes dark mode and `definePreset` work by overriding one variable instead
 * of regenerating everything downstream of it.
 */
export function resolveTokenValue(token: FlatToken, index: Map<string, FlatToken>): string {
  return replaceTokenRefs(token.value, (reference) => cssVarRef(lookup(index, reference, token.path).cssVar));
}

/**
 * Follows a token's references all the way down to the concrete CSS value they bottom out at.
 * Only defined for values that are a single reference or a literal -- a value that *embeds*
 * references in a larger expression has no single underlying token, so it's returned with its
 * references resolved textually instead.
 */
export function resolveTokenLiteral(path: string, index: Map<string, FlatToken>): string {
  const seen: string[] = [];
  let current = lookup(index, path, path);

  for (;;) {
    if (seen.includes(current.path)) {
      throw new CircularTokenReferenceError([...seen.slice(seen.indexOf(current.path)), current.path]);
    }
    seen.push(current.path);

    const refPath = wholeTokenRefPath(current.value);
    if (refPath === null) {
      return replaceTokenRefs(current.value, (reference) => {
        const target = lookup(index, reference, current.path);
        return resolveTokenLiteral(target.path, index);
      });
    }
    current = lookup(index, refPath, current.path);
  }
}

// ---------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------

/**
 * Checks every reference in a preset resolves, and that following references always terminates.
 *
 * Throws `MissingTokenReferenceError` (with "did you mean" suggestions) or
 * `CircularTokenReferenceError` (with the full cycle) on the first problem found. Called
 * automatically by `buildThemeVars`, and worth calling directly in a preset's own unit test.
 */
export function validatePreset(preset: ThemePreset): void {
  const { tokens, index } = flattenPreset(preset);

  // Cycle detection over the reference graph. `visiting` is the current DFS stack, so a back edge
  // into it is a genuine cycle rather than a node reached twice by two different paths.
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const stack: string[] = [];

  const walk = (token: FlatToken): void => {
    if (visited.has(token.path)) {
      return;
    }
    if (visiting.has(token.path)) {
      throw new CircularTokenReferenceError([...stack.slice(stack.indexOf(token.path)), token.path]);
    }
    visiting.add(token.path);
    stack.push(token.path);

    for (const reference of parseTokenRefs(token.value)) {
      walk(lookup(index, reference, token.path));
    }

    stack.pop();
    visiting.delete(token.path);
    visited.add(token.path);
  };

  for (const token of tokens) {
    walk(token);
  }
}

// ---------------------------------------------------------------------------------------------
// CSS generation
// ---------------------------------------------------------------------------------------------

/** Applies a preset's dark overrides, producing the full preset that dark mode describes. */
export function applyOverrides(preset: ThemePreset, overrides: ThemeOverrides | undefined): ThemePreset {
  if (!overrides) {
    return preset;
  }
  return deepMergeTokens(preset, overrides as never);
}

function generateVars(preset: ThemePreset): Record<string, string> {
  const { tokens, index } = flattenPreset(preset);
  const vars: Record<string, string> = {};
  for (const token of tokens) {
    vars[token.cssVar] = resolveTokenValue(token, index);
  }
  return vars;
}

/**
 * Compiles a preset into the CSS custom properties that back it.
 *
 * The dark set is computed by re-running generation over the preset with its dark overrides
 * applied, then keeping only the variables whose value actually differs. That's what lets a preset
 * override three semantic colors for dark mode and have every component that references them
 * follow, without listing a single component token twice -- and it means a component token that
 * *doesn't* depend on a dark-overridden value emits no dark declaration at all.
 *
 * Validates both the light and dark trees first, so a broken reference surfaces as a clear error
 * rather than as `var(--semiui-undefined)` in the browser.
 */
export function buildThemeVars(preset: ThemePreset): ThemeVars {
  validatePreset(preset);

  const root = generateVars(preset);

  const darkPreset = applyOverrides(preset, preset.dark);
  if (darkPreset === preset) {
    return { root, dark: {} };
  }

  validatePreset(darkPreset);
  const darkAll = generateVars(darkPreset);

  const dark: Record<string, string> = {};
  for (const [name, value] of Object.entries(darkAll)) {
    if (root[name] !== value) {
      dark[name] = value;
    }
  }
  return { root, dark };
}

/**
 * Resolves a single token path to the concrete value it bottoms out at, for tooling that needs the
 * literal rather than the `var()` indirection -- a docs colour swatch, a design-tool export.
 */
export function resolvePresetToken(preset: ThemePreset, path: string): string {
  const { index } = flattenPreset(preset);
  return resolveTokenLiteral(path, index);
}

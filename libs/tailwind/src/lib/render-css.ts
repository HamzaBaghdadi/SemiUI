import { ThemePreset, cssVarRef, flattenPreset } from '@semiui/tokens';
import { TailwindThemeEntry, TailwindThemeOptions, buildTailwindTheme } from './tailwind-theme';

/**
 * Extra utilities that Tailwind's `@theme` cannot express, because a named scale entry can only
 * ever produce `{utility}-{name}` classes -- a bare, un-suffixed class like `rounded-border` needs
 * its own definition. Keyed by utility name, valued by the SemiUI *token path* it renders, so this
 * file still never names a `--semiui-*` variable.
 */
const BARE_UTILITIES: ReadonlyArray<{ utility: string; property: string; tokenPath: string }> = [
  { utility: 'rounded-border', property: 'border-radius', tokenPath: 'radius.md' },
  { utility: 'border-surface', property: 'border-color', tokenPath: 'border' },
];

const GROUP_HEADINGS: ReadonlyArray<{ group: TailwindThemeEntry['group']; heading: string }> = [
  {
    group: 'color',
    heading:
      'Semantic colors. `bg-primary` follows whatever the preset points `primary` at -- including\n     its dark-mode override -- because the value below is a live var(), not a compiled color.\n     Aliases (danger/error/warn) are ordinary semantic tokens in the preset, so they arrive here\n     the same way and resolve through the same chain.',
  },
  {
    group: 'palette',
    heading: 'The semantic ramps, as `primary-50` .. `primary-950`.',
  },
  {
    group: 'primitive',
    heading:
      "The preset's own primitive scales, e.g. `bg-blue-500`. These deliberately take over\n     Tailwind's default palette names: under this integration the preset is the source of truth\n     for what `blue-500` means, so Carbon's `blue-500` is IBM Blue 60 and Cupertino's is\n     systemBlue. Pass `include` without 'primitive' if you would rather keep Tailwind's own.",
  },
  { group: 'radius', heading: 'Radius -- overrides Tailwind\'s own scale, so `rounded-md` follows the preset.' },
  {
    group: 'spacing',
    heading:
      "Spacing. Namespaced, because Tailwind resolves `max-w-*`, `w-*` and `h-*` named keys\n     through `--spacing-*` too: a bare `--spacing-xl` silently rewrites `max-w-xl` from 36rem to\n     1.5rem. Pass `scaleNamespace: null` to claim the bare names anyway.",
  },
  {
    group: 'typography',
    heading:
      "Typography. Namespaced for the same reason: `--text-sm` and `--font-weight-medium` reach\n     every piece of prose in the host app, not just SemiUI's own components.",
  },
];

function header(preset: ThemePreset): string {
  return `/**
 * SemiUI <-> Tailwind v4 bridge -- GENERATED, do not edit by hand.
 *
 * Regenerate with \`renderTailwindThemeCss({ preset })\` from \`@semiui/tailwind\`.
 * Generated from the "${preset.name}" preset's token tree; every value below is a \`var()\` into a
 * variable the SemiUI token engine emits, so there is exactly one source of truth for what
 * \`primary\` means -- the preset -- shared by SemiUI's components and Tailwind's utilities alike.
 *
 * Import it AFTER \`@import 'tailwindcss'\` in your global stylesheet:
 *
 *   @import 'tailwindcss';
 *   @import './tailwind/tailwind.css';
 *
 * \`@theme inline\` rather than a plain \`@theme\`: the \`--semiui-*\` values change at runtime (a
 * different preset, a toggled dark class), and \`inline\` keeps the utility pointing straight at the
 * live variable instead of adding a redundant \`:root\` copy. Opacity modifiers, variants and
 * arbitrary values all work normally -- \`dark:hover:bg-primary/30\` compiles to a \`color-mix()\`
 * over the same variable.
 *
 * Names are decided by the token engine, not by this file. The variable a token maps to comes from
 * \`tokenPathToCssVar\` in \`@semiui/tokens\`; nothing here hard-codes a \`--semiui-*\` string.
 */`;
}

/**
 * Renders a preset's Tailwind theme as CSS, for the CSS-first Tailwind v4 workflow (`@import` in a
 * global stylesheet, no JS config).
 *
 * Same generator as `semiuiTailwind()` -- this is only a different way to hand Tailwind the result.
 */
export function renderTailwindThemeCss(options: TailwindThemeOptions): string {
  const entries = buildTailwindTheme(options);
  const { index } = flattenPreset(options.preset);

  const byGroup = new Map<string, TailwindThemeEntry[]>();
  for (const entry of entries) {
    const list = byGroup.get(entry.group) ?? [];
    list.push(entry);
    byGroup.set(entry.group, list);
  }

  const sections: string[] = [];
  for (const { group, heading } of GROUP_HEADINGS) {
    const list = byGroup.get(group);
    if (!list?.length) {
      continue;
    }
    sections.push(
      `  /* ${heading} */\n` + list.map((entry) => `  ${entry.name}: ${entry.value};`).join('\n'),
    );
  }

  const utilities = BARE_UTILITIES.map(({ utility, property, tokenPath }) => {
    const target = index.get(tokenPath);
    return target ? `@utility ${utility} {\n  ${property}: ${cssVarRef(target.cssVar)};\n}` : null;
  }).filter((rule): rule is string => rule !== null);

  return [
    header(options.preset),
    `@theme inline {\n${sections.join('\n\n')}\n}`,
    utilities.length
      ? `/* Utilities Tailwind's \`@theme\` cannot express: a named scale entry only ever produces\n   \`{utility}-{name}\` classes, so a bare class like \`rounded-border\` needs its own definition.\n   \`@utility\` (rather than a plain rule) keeps variant composition working -- \`dark:rounded-border\`\n   and \`hover:border-surface\` behave like any built-in utility. */\n` +
        utilities.join('\n\n')
      : null,
  ]
    .filter((part): part is string => part !== null)
    .join('\n\n')
    .concat('\n');
}

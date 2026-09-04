/**
 * Regenerates the Tailwind bridge CSS from the Semi preset's token tree -- both the copy shipped as
 * a recipe and the one the docs app imports.
 *
 *   npx tsx scripts/generate-tailwind-recipe.mts
 *
 * The recipe is a build artifact, not hand-written source -- `libs/tailwind`'s own spec fails if
 * the checked-in file drifts from what the generator produces, so the two can't silently diverge.
 *
 * Semi is used because it is the default preset the CLI installs. The generated file only ever
 * contains `var(--semiui-*)` references, so it is correct for any preset sharing SemiUI's semantic
 * vocabulary; a preset that adds primitive scales of its own (Cupertino's `cyan`, Material's
 * `teal`) should regenerate it with `renderTailwindThemeCss({ preset })` to expose those too.
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { renderTailwindThemeCss } from '../libs/tailwind/src/lib/render-css';
import { Semi } from '../libs/presets/semi/src/lib/semi';

const css = renderTailwindThemeCss({ preset: Semi });

const targets = [
  join(process.cwd(), 'recipes', 'tailwind', 'tailwind.css'),
  // The docs app imports this from src/styles.css. Same bytes, same source of truth -- it is only
  // a separate file because an app can't import out of the recipes directory.
  join(process.cwd(), 'apps', 'docs', 'src', 'semiui-tailwind.css'),
];

for (const target of targets) {
  writeFileSync(target, css, 'utf8');
  console.log(`Wrote ${target}`);
}

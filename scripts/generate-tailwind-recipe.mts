/**
 * Regenerates `recipes/tailwind/tailwind.css` from the Semi preset's token tree.
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

const target = join(process.cwd(), 'recipes', 'tailwind', 'tailwind.css');
writeFileSync(target, renderTailwindThemeCss({ preset: Semi }), 'utf8');
console.log(`Wrote ${target}`);

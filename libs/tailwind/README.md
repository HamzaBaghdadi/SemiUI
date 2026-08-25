# @semiui/tailwind

Makes Tailwind a **consumer** of the SemiUI design-token system rather than a second one.

```
SemiUI preset
     |
 token engine (@semiui/tokens)  -- primitive -> semantic -> component, refs, dark overrides
     |
 generated CSS variables (--semiui-*)
     |
     +---------------------------+
     |                           |
SemiUI components        Tailwind utilities
```

`bg-primary` and `<s-button variant="primary">` resolve to the same variable, so they can't drift.
Change `semantic.primary` in the preset and both move together — no Tailwind config change, no
rebuild for a runtime theme switch.

## Usage

### Tailwind v4, CSS-first (what SemiUI's own apps use)

Generate the bridge once and `@import` it:

```ts
import { renderTailwindThemeCss } from '@semiui/tailwind';
import { Semi } from '@semiui/presets-semi';
import { writeFileSync } from 'fs';

writeFileSync('src/tailwind/semiui.css', renderTailwindThemeCss({ preset: Semi }));
```

```css
@import 'tailwindcss';
@import './tailwind/semiui.css'; /* after tailwindcss, so its values win */
```

The CLI ships a pre-generated copy of this for the default preset: `npx semiui add tailwind`.

### Tailwind with a JS config

```js
// tailwind.config.js  -- reached from CSS with `@config "./tailwind.config.js"`
import { semiuiTailwind } from '@semiui/tailwind';
import { Semi } from '@semiui/presets-semi';

export default { plugins: [semiuiTailwind({ preset: Semi })] };
```

Both entry points call the same `buildTailwindTheme`, and produce byte-identical utilities.

## What you get

| | Utilities | From |
| --- | --- | --- |
| Semantic colors | `bg-primary` `text-primary-foreground` `bg-success` `bg-destructive` `bg-muted` `text-muted-foreground` `border-border` `ring-ring` `bg-background` `text-foreground` `bg-secondary` `bg-info` `bg-warning` `bg-help` `bg-contrast` | `semantic.*` |
| Aliases | `bg-danger` `bg-error` `bg-warn` | the preset's own alias tokens |
| Semantic ramp | `bg-primary-50` … `bg-primary-950`, `bg-primary-contrast`, `bg-primary-emphasis` | `semantic.palette.*` |
| Primitive scales | `bg-blue-500` `text-slate-900` `border-red-200` | `primitive.*` |
| Radius | `rounded-sm` `rounded-md` `rounded-lg` `rounded-full` | `semantic.radius.*` |
| Spacing | `p-semiui-md` `gap-semiui-sm` | `semantic.spacing.*` |
| Typography | `font-semiui` `text-semiui-sm` `font-semiui-medium` | `semantic.typography.*` |
| Extras | `rounded-border` `border-surface` | `radius.md` / `border` |

Opacity modifiers work normally — `bg-primary/10`, `border-primary/30`, `dark:hover:bg-primary/50`
— because every value is a live `var()` and Tailwind v4 wraps it in `color-mix()`.

Dark mode needs no `dark:` variants for SemiUI colors. `bg-background text-foreground` is correct in
both modes: the preset's dark block redefines `--semiui-color-background`, and the utility points at
it.

**Component tokens are never exposed.** `components.button.variants.primary.background` stays
internal; there is no `bg-button-primary-background`.

## Options

```ts
buildTailwindTheme({
  preset: Semi,
  scaleNamespace: 'semiui', // default; null claims the bare names
  include: ['primitive', 'color', 'palette', 'spacing', 'radius', 'typography'], // default
});
```

**`scaleNamespace`** applies to spacing and typography only. The default is not caution — it is a
measured constraint. Tailwind v4 resolves `max-w-*`, `w-*` and `h-*` named keys through
`--spacing-*` as a fallback, so defining a bare `--spacing-xl` silently rewrites `max-w-xl` from
36rem to SemiUI's 1.5rem (verified against Tailwind 4.3.3). Typography is namespaced for the same
reason: `--text-sm` and `--font-weight-medium` reach every piece of prose in the host app. Pass
`scaleNamespace: null` if you want `p-md` and accept that trade.

Colors and radius are deliberately never namespaced — `bg-primary` and `rounded-md` following the
active preset is the point.

**`include`** drops whole token groups. `include: ['color', 'palette', 'radius']` keeps Tailwind's
own default palette instead of the preset's primitives. `'component'` is rejected.

## API

| Export | Returns |
| --- | --- |
| `buildTailwindTheme(options)` | `TailwindThemeEntry[]` — `{ name, value, tokenPath, group }` per variable |
| `buildTailwindThemeMap(options)` | the same as `{ '--color-primary': 'var(--semiui-color-primary)' }` |
| `renderTailwindThemeCss(options)` | the `@theme inline` stylesheet |
| `semiuiTailwind(options)` | a Tailwind plugin |

## How it stays honest

This package contains **no list of colors and no `--semiui-*` string**. It walks the preset's token
tree with `flattenPreset`, classifies each token with the engine's own `tokenGroup`, and asks
`tokenPathToCssVar` for the variable name. Add a semantic token to a preset and it becomes a
Tailwind utility with no change here; rename the CSS variable convention in `@semiui/tokens` and
this follows automatically.

`libs/tailwind`'s spec asserts the checked-in `recipes/tailwind/tailwind.css` is byte-identical to
what the generator produces, so the shipped recipe can't drift from the generator either.

## Dependencies

Only `@semiui/tokens`. This package never imports `tailwindcss` — it emits CSS text and a plain
plugin object, both of which Tailwind consumes. Targets Tailwind v4 (verified against 4.3.3);
the `@theme inline` output and the plugin's `theme.extend` config are both v4 APIs.

## Tests

`nx test tailwind`

# Applying a custom design to SemiUI

This file is for an AI agent asked to theme, rebrand, or otherwise customize a project that uses
SemiUI. Read this before touching any `--semiui-*` CSS variable or component `.css` file by hand —
almost every styling request has a token-level answer that is one object literal, not a CSS patch.

## The one rule

**Never edit a generated CSS variable, a component's `.css` file, or a Tailwind class to change a
color, radius, spacing value, or font.** All of those are *outputs* of a preset. Edit the preset
instead. If you patch the output, the next preset regeneration (or the user picking a different
preset, or toggling dark mode) silently reverts your change.

If a request is "make the button corners more rounded" or "our brand color is #8b5cf6" or "we use
Roboto, not Inter" — that is a preset edit, never a `.css` edit.

## Decision tree

**"Change our primary/brand color"** → [Recolor an existing preset](#1-recolor-an-existing-preset)

**"Change a handful of things (radius, font, a couple of colors)"** →
[Recolor an existing preset](#1-recolor-an-existing-preset), same mechanism, more overrides

**"We have a full design system / Figma tokens to match exactly"** →
[Build a preset from scratch](#2-build-a-preset-from-scratch)

**"Make this one component look different everywhere"** →
[Override one component's tokens](#3-override-one-components-tokens)

**"Support light AND dark, our dark palette is different"** → [Dark mode](#4-dark-mode)

**"This project uses Tailwind classes (`bg-primary`, `rounded-md`, ...) directly"** →
same preset edit; read [Tailwind](#5-tailwind) for the one extra regeneration step

**"I don't know which packages this project has installed"** → run:
```bash
cat components.json 2>/dev/null   # { "preset": "semi", ... } if `semiui init` was run here
grep -l "@semiui/presets-" package.json apps/*/package.json 2>/dev/null
grep -rn "provideSemiUI(" src apps --include=*.ts 2>/dev/null
```

---

## 1. Recolor an existing preset

This covers "change the brand color", "use our font", "square off the corners" — any request that
is a handful of design decisions, not a from-scratch design system.

```ts
import { definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi'; // or Aurora / Carbon / Cupertino / Fluent / Material / Samsung

export const MyTheme = definePreset(Semi, {
  name: 'my-theme',

  // Only needed if the brand color isn't already one of the base preset's primitive shades.
  primitive: {
    brand: {
      50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
      500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
    },
  },

  semantic: {
    primary: '{brand.500}',
    primaryForeground: '{white}',
    palette: { primary: '{brand}' }, // keeps the bg-primary-50..950 Tailwind ramp in sync
    typography: { fontFamily: '"Your Font", sans-serif' },
    radius: { sm: '0', md: '0', lg: '0' }, // e.g. square corners everywhere
  },

  dark: {
    semantic: { primary: '{brand.400}' }, // usually one shade lighter is enough; see §4
  },
});
```

Then wire it up in place of whatever preset the app currently provides:

```ts
// app.config.ts
import { provideSemiUI } from '@semiui/theme';
import { MyTheme } from './my-theme';

providers: [
  provideSemiUI({ preset: MyTheme }),
  // ...
],
```

That single `semantic.primary` change reaches every component that reads `{primary}` — Button,
Tag, Badge, focus rings, checked Checkbox/Radio, the Slider fill, the active Tab indicator,
Pagination, the selected day in Date Picker, and more — with zero per-component edits. If the
request only touches `primary`/`success`/`destructive`/`radius`/`typography.fontFamily`, that's
the entire task. Don't go component-hunting for more to change.

**What NOT to do:** don't copy `Semi`'s full ~800-line token tree and edit values inline. `Semi`
already holds the ~30 semantic decisions every other built-in preset composes from — extend it,
don't duplicate it. Look at any file in `libs/presets/{aurora,carbon,cupertino,fluent,material,
samsung}/src/lib/*.ts` for the pattern of "genuine differences only" (~100–300 lines each).

## 2. Build a preset from scratch

Only do this when the request is a genuinely new design system (a full Figma token export, a
different vendor's spec) rather than a recolor. Start from `libs/presets/semi/src/lib/semi.ts` as
the structural template — copy its shape, not its values — or read
[`libs/tokens/README.md`](libs/tokens/README.md) for the full authoring guide including every
token category.

The three layers, in the order you write them:

```ts
import { ThemePreset } from '@semiui/tokens';

export const MyTheme: ThemePreset = {
  name: 'my-theme',

  // 1. Primitives: raw values only, no meaning. Colors as full 50-950 ColorScale ramps.
  primitive: {
    white: '#ffffff', black: '#000000', transparent: 'transparent',
    blue: { 50: '#...', 100: '#...', /* ... */ 950: '#...' },
    slate: { /* neutral ramp */ },
    red: { /* destructive ramp */ },
    green: { /* success ramp */ },
    amber: { /* warning ramp */ },
    // generateColorScale('#yourHex') from '@semiui/tokens' auto-generates a ramp from one base color
  },

  // 2. Semantics: what values MEAN. Every field below is required (see SemanticTokens type).
  semantic: {
    background: '{white}', foreground: '{slate.900}',
    primary: '{blue.500}', primaryForeground: '{white}',
    secondary: '{muted}', secondaryForeground: '{foreground}',
    success: '{green.600}', successForeground: '{white}',
    info: '{blue.500}', infoForeground: '{white}',
    warning: '{amber.600}', warningForeground: '{white}',
    destructive: '{red.600}', destructiveForeground: '{white}',
    help: '{violet.500}', helpForeground: '{white}',
    contrast: '{foreground}', contrastForeground: '{background}', // free inversion, see §4
    muted: '{slate.100}', mutedForeground: '{slate.500}',
    border: '{slate.200}', ring: '{primary}',
    danger: '{destructive}', dangerForeground: '{destructiveForeground}', // aliases, not copies
    error: '{destructive}', errorForeground: '{destructiveForeground}',
    warn: '{warning}', warnForeground: '{warningForeground}',
    palette: { primary: '{blue}' }, // whole-scale reference -> primary-50..950
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' },
    radius: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', full: '9999px' },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: { sm: '0.875rem', md: '1rem' },
      fontWeight: { medium: '500' },
    },
  },

  // 3. Components: every field in ComponentTokens (button, input, select, switch, checkbox, ...).
  //    Reference semantic tokens ({primary}), the shared scales ({radius.md}, {spacing.md}), or
  //    raw CSS for values genuinely local to one component (a dialog's width, an elevation shadow).
  components: {
    button: {
      radius: '{radius.md}',
      fontWeight: '{typography.fontWeight.medium}',
      /* ...see the full ButtonTokens shape in libs/tokens/src/lib/token-types.ts */
      variants: {
        primary: { background: '{primary}', foreground: '{primaryForeground}', border: '{primary}' },
        /* secondary, destructive, danger, success, info, warn, help, contrast, link */
      },
    },
    /* input, select, switch, checkbox, radio, popover, tooltip, ...one entry per component --
       copy the full component list from semi.ts, it is exhaustive. */
  },

  dark: {
    semantic: { /* see §4 -- usually semantic overrides only, no component tree */ },
  },

  icons: { /* IconTokens -- see semi.ts for the full slot list */ },
};
```

`ComponentTokens` has 41 entries (one per component — button, input, select, switch, checkbox,
radio, popover, tooltip, ...) and every one is required by the type. **Do not hand-write all of
them from a blank object** — copy `libs/presets/semi/src/lib/semi.ts` wholesale as a starting file,
then replace `primitive`/`semantic` values and only the `components` fields the new design
genuinely changes. This is far less error-prone than authoring the shape from the type definitions.

After writing it, validate before wiring it up:

```ts
import { validatePreset } from '@semiui/tokens';
validatePreset(MyTheme); // throws MissingTokenReferenceError / CircularTokenReferenceError with a message pointing at the exact bad token
```

## 3. Override one component's tokens

For "just make buttons more rounded than everything else" or "our dialogs need a heavier shadow" —
don't touch `radius.md` globally, override the one component:

```ts
export const MyTheme = definePreset(Semi, {
  components: {
    button: { radius: '{radius.full}' }, // only buttons go pill-shaped
    dialog: { shadow: '0 24px 48px -12px rgb(0 0 0 / 0.35)' }, // raw CSS is fine when it's genuinely local
  },
});
```

`definePreset` deep-merges — this does not clobber the other 30+ fields on `button` or `dialog`,
and does not touch any other component.

## 4. Dark mode

Dark mode is a `dark: { semantic: {...} }` block, almost never a `components` override:

```ts
dark: {
  semantic: {
    background: '{slate.950}',
    foreground: '{slate.100}',
    primary: '{blue.400}',        // usually one shade lighter than light mode
    primaryForeground: '{slate.900}', // and its ink usually flips toward near-black
    muted: '{slate.900}',
    mutedForeground: '{slate.400}',
    border: '{slate.800}',
  },
},
```

Because every component token references `{primary}` rather than a literal, redefining `primary`
here is enough — Button/Tag/Badge/focus-rings/etc. all pick it up with no `components` block in
`dark` at all. Only add a `dark.components` override if a component's *shape* (not color) should
differ in dark mode, which is rare.

`contrast`/`contrastForeground` need no dark override if you wrote them as `'{foreground}'` /
`'{background}'` in the light semantic block — they invert automatically because their targets do.

**Verify it actually differs**, don't just eyeball it:
```ts
import { buildThemeVars } from '@semiui/tokens';
const { dark } = buildThemeVars(MyTheme);
console.log(dark); // should be non-empty and should NOT contain any --semiui-comp-* keys
                    // unless you deliberately added a dark.components override
```

## 5. Tailwind

If the project uses Tailwind utility classes (`bg-primary`, `rounded-md`, `text-muted-foreground`)
rather than only SemiUI components, the bridge CSS must be regenerated after any preset change —
it is a build artifact, not something to hand-edit:

```ts
// scripts/generate-tailwind-recipe.mts (adapt the preset import to MyTheme)
import { writeFileSync } from 'fs';
import { renderTailwindThemeCss } from '@semiui/tailwind';
import { MyTheme } from './my-theme';

writeFileSync('src/tailwind/semiui.css', renderTailwindThemeCss({ preset: MyTheme }));
```

```bash
npx tsx scripts/generate-tailwind-recipe.mts
```

Never hand-edit the generated `.css` file, and never add a second `--color-primary` /
`--color-success` /etc. declaration elsewhere in the app's stylesheet — that creates a second
source of truth that silently wins or loses the cascade depending on import order. If the app has
its own `@theme` block for things SemiUI doesn't cover (a numeric spacing scale, `text-xs`..`text-
4xl`, extra brand palettes), that's fine; just don't redeclare any semantic color SemiUI already
owns. See [`libs/tailwind/README.md`](libs/tailwind/README.md) for the full utility list and the
`scaleNamespace`/`include` options.

## Reference: how a value resolves

```
'{primary}'  (component token, e.g. button.variants.primary.background)
      |
'{blue.500}' (semantic token: primary)
      |
'#3b82f6'    (primitive: blue.500)
```

- A token value is a string: a `{path}` reference, raw CSS (`'0.5rem'`, `'transparent'`, a full
  `color-mix(...)` expression), or a reference embedded inside raw CSS
  (`'color-mix(in srgb, {primary} 15%, transparent)'`).
- References resolve semantic first, then primitive, then component tokens (only reachable via an
  explicit `components.` prefix).
- The generated CSS variable name is decided by the token engine, never by you — `primary` becomes
  `--semiui-color-primary`, `components.button.radius` becomes `--semiui-comp-button-radius`. Don't
  write `var(--semiui-...)` inside a preset; write `'{primary}'` and let the engine do it.

## Checklist before handing back a themed build

- [ ] Every color/radius/spacing/font change lives in a preset object, not in `.css`
- [ ] `validatePreset(MyTheme)` (or `buildThemeVars(MyTheme)`) does not throw
- [ ] `dark.semantic` exists and differs from light for at least `background`/`foreground`/`primary`
- [ ] If Tailwind utilities are used: the bridge CSS was regenerated, not hand-edited
- [ ] `provideSemiUI({ preset: MyTheme })` points at the new preset, and no other `provideSemiUI`
      call in the app still points at the old one
- [ ] No new `--semiui-*` variable name was invented by hand anywhere

## Further reading

- [`libs/tokens/README.md`](libs/tokens/README.md) — full token API, every export, validation/error
  details
- [`libs/tailwind/README.md`](libs/tailwind/README.md) — full Tailwind utility list and options
- [`libs/presets/semi/src/lib/semi.ts`](libs/presets/semi/src/lib/semi.ts) — the canonical, complete
  preset to copy from
- [`libs/presets/carbon/src/lib/carbon.ts`](libs/presets/carbon/src/lib/carbon.ts) and its siblings
  — worked examples of `definePreset(Semi, {...})` recoloring/reshaping at ~100–300 lines each

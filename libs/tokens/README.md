# @semiui/tokens

SemiUI's design token engine. Framework-agnostic — no Angular dependency, no build plugin.

A theme is described as three layers of plain data, and the engine turns them into CSS custom
properties:

```
Primitive tokens    raw values          blue.500 = '#3b82f6'
       |
Semantic tokens     meanings            primary  = '{blue.500}'
       |
Component tokens    decisions           button.variants.primary.background = '{primary}'
       |
CSS variables       generated           --semiui-comp-button-variants-primary-background:
                                          var(--semiui-color-primary)
```

A preset never names a CSS variable. It writes `{token.path}` references, and the engine resolves
them — which is what makes one override propagate everywhere downstream of it.

## Writing a preset

```ts
import { ThemePreset } from '@semiui/tokens';

export const MyPreset: ThemePreset = {
  name: 'my-preset',

  primitive: {
    white: '#ffffff',
    blue: { 50: '#eff6ff', /* ... */ 400: '#60a5fa', 500: '#3b82f6', /* ... */ 950: '#172554' },
    slate: { /* ... */ },
  },

  semantic: {
    background: '{white}',
    foreground: '{slate.900}',
    primary: '{blue.500}',
    primaryForeground: '{white}',
    ring: '{primary}',            // an alias, not a copy
    danger: '{destructive}',      // ditto

    palette: { primary: '{blue}' }, // whole-scale reference, expanded shade by shade
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' },
    radius: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', full: '9999px' },
    typography: { fontFamily: 'Inter, sans-serif', fontSize: { sm: '0.875rem', md: '1rem' }, fontWeight: { medium: '500' } },
  },

  dark: {
    // Only the meanings that change. Component tokens reference the semantic layer, so they
    // follow on their own -- there is no parallel dark component tree.
    semantic: { primary: '{blue.400}', background: '{slate.950}', foreground: '{slate.200}' },
  },

  components: {
    button: {
      radius: '{radius.md}',
      fontWeight: '{typography.fontWeight.medium}',
      paddingX: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
      variants: {
        primary: { background: '{primary}', foreground: '{primaryForeground}', border: '{primary}' },
      },
    },
  },

  icons: { /* ... */ },
};
```

## Token values

A token's value is always a string, and can be any of:

| Form | Example |
| --- | --- |
| A reference | `'{blue.500}'`, `'{primary}'`, `'{typography.fontSize.sm}'` |
| A raw CSS value | `'0.5rem'`, `'transparent'`, `'0 8px 24px rgb(15 23 42 / 0.10)'` |
| Raw CSS with references embedded | `'color-mix(in srgb, {primary} 15%, transparent)'` |
| An explicit `var()` | `'var(--color-green-500)'` — for pointing outside the token system |

References resolve against the semantic layer first, then primitives, then component tokens under
an explicit `components.` prefix. Each layer is also addressable by prefix (`{primitive.blue.500}`,
`{semantic.primary}`) when a name is defined in two layers.

Not everything has to be a token. A value that is genuinely local to one component — a dialog's
width, a stagger delay, an elevation shadow — is better left as a raw value than turned into a
global token nothing else would use.

## Extending a preset

```ts
import { definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

const MyTheme = definePreset(Semi, {
  primitive: { violet: { 500: '#8b5cf6' } },
  semantic: { primary: '{violet.500}' },
});
```

That is the whole change. Button, tag, badge, focus rings, checked checkboxes and radios, the
slider fill, the active tab indicator, pagination, the date picker's selected day and everything
else that reads `{primary}` follow, in both light and dark mode.

`definePreset` merges key by key at every depth, so overriding `blue.500` keeps the other ten
shades, and overriding one button variant keeps the other nine. It never mutates the base, and
derived presets can themselves be extended.

## Generated CSS variable names

The engine owns these; presets never write them.

| Token path | CSS variable |
| --- | --- |
| `primitive` `blue.500` | `--semiui-primitive-blue-500` |
| `semantic` `primary` | `--semiui-color-primary` |
| `semantic` `primaryForeground` | `--semiui-color-primary-foreground` |
| `semantic` `palette.primary.500` | `--semiui-color-palette-primary-500` |
| `semantic` `spacing.md` | `--semiui-spacing-md` |
| `semantic` `radius.md` | `--semiui-radius-md` |
| `semantic` `typography.fontSize.sm` | `--semiui-typography-font-size-sm` |
| `components` `button.variants.primary.background` | `--semiui-comp-button-variants-primary-background` |

References stay references in the output: `primary: '{blue.500}'` generates
`--semiui-color-primary: var(--semiui-primitive-blue-500)`, not a copy of the hex. That indirection
is what lets dark mode redefine three variables and have everything downstream follow through the
cascade rather than through a second generated tree.

## API

| Export | What it does |
| --- | --- |
| `buildThemeVars(preset)` | Compiles a preset to `{ root, dark }` variable maps. Validates first. |
| `definePreset(base, overrides)` | Builds a new preset from an existing one. |
| `deepMergeTokens(base, overrides)` | The merge `definePreset` uses, on its own. |
| `validatePreset(preset)` | Throws on a missing or circular reference. Worth calling in a preset's own test. |
| `resolvePresetToken(preset, path)` | Follows a token down to the literal it bottoms out at, for tooling. |
| `flattenPreset(preset)` | The flattened token list plus the reference lookup index. |
| `generateColorScale(base)` | An 11-step tint/shade ramp from one hex, anchored so `[500] === base`. |
| `tokenPathToCssVar(layer, path)` | The naming rule above, as a function. |

Diagnostics are typed: `MissingTokenReferenceError` (with "did you mean" suggestions),
`CircularTokenReferenceError` (with the cycle), both extending `TokenError`.

## Tests

`nx test tokens`

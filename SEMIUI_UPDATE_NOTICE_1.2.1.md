# Semi UI — Update Notice

|                      |                                                                                   |
| -------------------- | --------------------------------------------------------------------------------- |
| **Release**          | 1.2.1 (patch). Follows 1.2.0.                                                     |
| **Date**             | 4 October 2026                                                                     |
| **Responds to**      | *Semi UI 1.2.0 — two follow-up bugs*, `docs/SEMIUI_ICON_AND_CAROUSEL_BUGS.md`, submitted by the Safeer landing-page team |
| **Packages**         | `@semiui/tokens`, `@semiui/theme`, `@semiui/primitives`, `@semiui/presets-semi`, `@semiui/cli` |
| **Breaking changes** | None                                                                               |

---

## 1. Summary

This release fixes the two bugs the Safeer team found after migrating off their forked
accordion/carousel/select back onto 1.2.0's stock components: a custom icon passed through
`<s-icon>` couldn't actually be resized by a component's size token (BUG-8), and Carousel's
floating arrows could center on the wrong box when dots were shown (BUG-9). Both were found by
reading the library's own shipped code, not guessed from a screenshot, and both are reproducible
from it — see the original report for the full trace.

Workarounds in your `src/styles.css` for either bug should be removed after upgrading; section 4
gives the exact CSS to delete.

| Bug | Component(s) | What changed |
| --- | --- | --- |
| BUG-8 | Select family, Accordion, Tag, Table, Tree Table, Full Calendar, Scroll Top, Rich Text Editor, Timeline | Icon-size tokens now actually resize the rendered glyph, not just the box around it |
| BUG-9 | Carousel | Floating arrows (and the autoplay toggle) position against the viewport, not the viewport-plus-dots |

---

## 2. Upgrading

```bash
npm install @semiui/tokens@latest @semiui/theme@latest @semiui/primitives@latest @semiui/presets-semi@latest @semiui/cli@latest
npx semiui update --dry-run
npx semiui update
```

No input, token name, or CSS class was renamed or removed. If you copied `select`, `multiselect`,
`cascade-select`, `accordion`, `tag`, `table`, `tree-table`, `full-calendar`, `scroll-top`,
`rich-text-editor`, `timeline` or `carousel` with the CLI, `semiui update` merges this fix into
your copies the same way it merged 1.2.0's.

---

## 3. BUG-8 — icon-size tokens didn't resize the rendered icon

### The defect

`<s-icon>` renders a ref through `@ng-icons/core`'s `<ng-icon>`, which sizes itself from its own
`--ng-icon__size` custom property (falling back to `1em` of its own `font-size`) — never from a
`width`/`height` set on an ancestor, since `width`/`height` are not inherited CSS properties.
Every component CSS rule that sized an icon this way —

```css
.s-select__icon {
  width: var(--semiui-comp-select-icon-size);
  height: var(--semiui-comp-select-icon-size);
}
```

— correctly resized the **box** (the `<span>` or `<s-icon>` host it was declared on), but the
glyph rendered inside it stayed at whatever size it inherited by accident. This was invisible with
the stock `chevronDown` glyph, which happens to look acceptable at any nearby inherited size, and
became clearly visible with a custom icon drawn for a specific size.

### The fix

Every one of these rules now also sets `--ng-icon__size` — the one property `ng-icon` actually
reads — which, being a custom property, *is* inherited and reaches the nested `<ng-icon>`
regardless of how many elements sit in between:

```css
.s-select__icon {
  width: var(--semiui-comp-select-icon-size);
  height: var(--semiui-comp-select-icon-size);
  --ng-icon__size: var(--semiui-comp-select-icon-size);
}
```

Fixed directly this way, since their default value is exactly `1em` (ng-icon's own fallback, so
the fix is a no-op at the default and a custom icon simply works):

- **Select, Multiselect, Cascade Select** — `select.iconSize` (the trigger chevron and the clear
  "✕" control, which reuses the same token for its footprint)

Fixed the same way, where each token's own documentation already said it sizes the icon (not a
box) — their defaults are **not** `1em`, so each glyph now renders a few pixels closer to its
documented size than it accidentally did before (every one measured live; see section 5):

- **Tag** — `iconSize`, `removeIconSize`
- **Table** — `sortIconSize`
- **Tree Table** — `toggleIconSize`
- **Full Calendar** — `navIconSize`
- **Scroll Top** — `iconSize`
- **Rich Text Editor** — `toolIconSize`
- **Timeline** — `markerIconSize`

### Accordion: a new, separate token

Accordion's `chevronSize` doc comment already said *box*, deliberately — a filled, circular
indicator is meant to be bigger than the arrow inside it. Repurposing `chevronSize` to also size
the glyph would have made every default, visible accordion chevron on every site 2 px bigger
overnight. Instead, Accordion gets a new, documented token for the glyph:

| Token | Purpose | Default |
| --- | --- | --- |
| `accordion.chevronSize` | The indicator's box — its hit area, and the fill when `chevronBackground` is set | `1rem` (unchanged) |
| `accordion.chevronIconSize` | **New.** The indicator's rendered glyph, independent of its box | `1em` (ng-icon's own fallback — a no-op; the default accordion chevron is pixel-identical to 1.2.0) |

```ts
definePreset(Semi, {
  icons: {
    accordionChevron: { type: 'svg', markup: '<svg ... stroke="currentColor">...</svg>' },
  },
  components: {
    accordion: {
      chevronSize: '2.5rem', // the filled circle
      chevronBackground: '{primary}',
      chevronRadius: '9999px',
      chevronIconSize: '{components.accordion.chevronSize}', // the arrow now fills that circle
    },
  },
});
```

Leaving `chevronIconSize` unset keeps today's look exactly: a bare glyph at its own natural size,
however big or small the box around it is.

---

## 4. BUG-9 — Carousel's floating arrows could center on the wrong box

### The defect

The floating (non-`outside`) arrow buttons and the autoplay toggle are `position: absolute; top:
50%` elements. They were DOM siblings of `.s-carousel__body` (which holds the viewport) **and**
`.s-carousel__dots` (the dot row below it), both direct children of `.s-carousel`. Their
containing block for `top: 50%` was therefore `.s-carousel` as a whole — body *and* the gap above
the dots *and* the dots row — not the viewport alone. With dots visible, that put the arrows
measurably below the viewport's true center; the offset scales with dot size and the gap above
the dots.

This was not limited to `centerMode`. `centerMode` forces the floating-arrow style unconditionally
(it disables `arrowsOutside`), so the report found it there, but **the library's own default
`<s-carousel>` usage — floating arrows, dots on, nothing else set — had the identical offset.**

### The fix

The floating arrows and the autoplay toggle now live inside `.s-carousel__body` (which,
`position: relative`, becomes their containing block), alongside the outside-arrow variant that
was already there and never affected. `.s-carousel__body` holds nothing but the viewport, so
`top: 50%` is now always the viewport's true vertical center, with or without dots, with or
without the autoplay toggle, in LTR and RTL, in and out of `centerMode`.

No CSS variable, input, or class changed name. If you added the workaround from the report —

```css
.s-carousel[data-center] .s-carousel__dots {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  margin-top: 0;
  transform: translateY(calc(100% + var(--semiui-spacing-sm)));
}
```

— remove it; the arrows are centered correctly without it now, for every carousel configuration,
not only `[data-center]`.

---

## 5. Verification

Every number below is a live `getBoundingClientRect()`/computed-style measurement against the
docs dev server, not an assertion from reading the CSS.

| Check | Result |
| --- | --- |
| Select: `iconSize: 32px` renders a 32px glyph (was stuck at the inherited ~14px) | Measured 32×32px, both the chevron and the clear "✕" |
| Select: default `iconSize` (`1em`) renders the glyph at the same size as 1.2.0 | Measured 14×14px, unchanged |
| Multiselect, Cascade Select: share the same fix via `select.iconSize` | Measured 28×28px with a 28px override |
| Accordion: default `chevronIconSize` (`1em`) leaves the glyph exactly as in 1.2.0 | Measured 14×14px, unchanged |
| Accordion: growing `chevronSize` alone (the box) does **not** also grow the glyph | Measured 14×14px glyph inside a 40px box |
| Accordion: `chevronIconSize` now actually resizes the glyph | Measured 32×32px |
| Tag, Table, Tree Table, Full Calendar, Scroll Top, Rich Text Editor, Timeline: each token now resizes its glyph | Measured on all eight, each within 1.5px of the token's set value |
| Carousel (stock default: floating arrows + dots): arrow vertical offset from the viewport's center | **Before:** ~8px low. **After:** 0px |
| Carousel (`centerMode`): same offset, LTR and RTL | **Before:** ~8px low. **After:** 0px, both directions |
| Carousel: autoplay toggle stays inset from the viewport's own corner | 8px / 8px, matching `arrowOffset`, unaffected by the move |
| Carousel: outside-arrow variant (never affected) | Unchanged, still renders |
| Console errors on every page touched | None, in light and dark, LTR and RTL |
| Library unit tests (tokens, theme, primitives, all seven presets, CLI) | 123 pass, plus two new guard tests (every icon-size token wires `--ng-icon__size`; the carousel's floating controls render inside `.s-carousel__body`, before the dots) |
| Production build of the docs app, lint on every changed file | Clean |

### Not covered

- The eight audited icon tokens (everything except Select's family and Accordion) now render a
  few pixels closer to their own documented size than they did by accident in 1.2.0. This is the
  intended fix, not a regression, but if your design happened to rely on the old, undocumented,
  inherited size for one of these, re-check it after upgrading. Section 3 lists all eight.

---

## 6. Files changed

| Area | Location |
| --- | --- |
| New token | `libs/tokens/src/lib/token-types.ts` (`components.accordion.chevronIconSize`) |
| Semi preset default | `libs/presets/semi/src/lib/semi.ts` |
| Icon-size wiring | `recipes/{select,multiselect,cascade-select,accordion,tag,table,tree-table,full-calendar,scroll-top,rich-text-editor,timeline}/*.component.css` (mirrored to `apps/docs/src/app/components/`) |
| Carousel arrow/toggle positioning | `recipes/carousel/carousel.component.{html,css}` (mirrored to `apps/docs/src/app/components/carousel/`) |
| Regression guards | `libs/presets/semi/src/lib/semi.spec.ts` |
| Documentation | Accordion's theming table, the theming guide's icon section, `AGENTS.md`, `libs/tokens/README.md` |
| Release | `.changeset/icon-and-carousel-bugs.md` |

---

*Thank you to the Safeer team for tracing both of these to their actual root cause in the library's
own source before reporting them — it made this fix exact rather than a guess.*

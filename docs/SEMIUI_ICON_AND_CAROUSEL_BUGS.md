# Semi UI 1.2.0 — two follow-up bugs

**Reported by:** Safeer landing page team
**Version:** 1.2.0 (the release that implemented `SEMIUI_BUGS_AND_ENHANCEMENTS_REPORT.md`)
**Context:** after migrating off our forked accordion/carousel/select back onto the stock 1.2.0 components (deleting our local edits and moving everything into `definePreset(...)`), two visual differences from our pre-migration site turned out to be bugs in 1.2.0 itself, not something expressible from the preset. We've worked around both locally in `src/styles.css` (clearly marked, to be removed once fixed upstream) and are reporting them so the workarounds can go away.

---

## BUG-8 — A custom icon passed through `<s-icon>` can't actually be resized by a component's size token

**Components affected:** at minimum Select (`iconSize`) and Accordion (`chevronSize`); very likely every component that exposes a token meant to size an icon rendered via `<s-icon>`.

### What's wrong

`<s-icon>` renders its `ref` through `@ng-icons/core`'s `<ng-icon>`:

```css
/* ng-icons-core */
:host { width: var(--ng-icon__size, 1em); height: var(--ng-icon__size, 1em); ... }
:host ::ng-deep svg { width: inherit; height: inherit; ... }
```

The rendered glyph's size is always `1em` of **whatever `font-size` the `<ng-icon>` element inherits**, unless the CSS custom property `--ng-icon__size` is set. It does **not** read a `width`/`height` set on an ancestor element — `width`/`height` aren't inherited CSS properties, so sizing a wrapper box that way has no effect on the glyph inside it.

Select and Accordion's new size tokens are wired exactly that way:

```css
/* select.component.css */
.s-select__icon {
  width: var(--semiui-comp-select-icon-size);
  height: var(--semiui-comp-select-icon-size);
  color: var(--semiui-comp-select-placeholder-foreground);
}
```
```html
<span class="s-select__icon">
  <s-icon [ref]="icons.selectChevron ?? icons.chevronDown" />
</span>
```

```css
/* accordion.component.css */
.s-accordion__chevron {
  width: var(--semiui-comp-accordion-chevron-size);
  height: var(--semiui-comp-accordion-chevron-size);
  background: var(--semiui-comp-accordion-chevron-background);
  ...
}
```
```html
<s-icon class="s-accordion__chevron" [ref]="icons.accordionChevron ?? icons.chevronDown" />
```

In both cases, the class carrying the size token is on an **ancestor** of the actual `<ng-icon>` (either a wrapping `<span>`, or the `<s-icon>` host two DOM levels above `<ng-icon>`). The `width`/`height` there sizes that ancestor's own box — correct for Accordion's filled circle, since that's a deliberately bigger hit target than the glyph — but the **glyph itself** silently stays at `1em` of the inherited font-size (Select: `~14px`, from `.s-select__trigger`'s own `font-size`; Accordion: `~14px`, from `.s-accordion__header`'s own `font-size`), no matter what `select.iconSize` or `accordion.chevronSize` is set to.

This is invisible with the stock `chevronDown` glyph, because it happens to look acceptable at the inherited size. It becomes very visible with a `selectChevron` / `accordionChevron` **custom** icon drawn for a specific size: ours is a 32-viewBox arrow with a 1.67 stroke-width, designed to read at roughly 32px inside Accordion's 2.5rem circle (an ~80% fill) and roughly 20px for Select. Routed through `<s-icon>`, both instead render at ~14px — a real, measurable shrink (roughly 2× smaller for the accordion glyph), making the "round filled arrow button" look like a tiny arrow adrift in a big circle, and the select trigger's chevron look undersized next to the rest of the field.

### How we worked around it (for now)

In our own global stylesheet, *not* in the component files:

```css
.s-select__icon {
  font-size: 1.25rem; /* the glyph's intended size */
}
.s-accordion__chevron {
  font-size: 2rem;
}
```

`font-size` *is* inherited, so this reaches the nested `<ng-icon>`'s own `1em` correctly. It's a workaround, not a fix we're happy keeping: it's a magic number next to the real token, invisible to anyone reading `components.ts`, and it'll silently stop being necessary (or start double-applying) whenever this is fixed upstream.

### Suggested fix

Either:
- **(a)** Also set the inherited custom property, e.g. `.s-select__icon { --ng-icon__size: var(--semiui-comp-select-icon-size); }` (same idea, but keyed to the mechanism `<ng-icon>` actually reads, so a preset never has to know `<ng-icon>` is involved), or
- **(b)** Size the glyph via `font-size` directly in the component's own CSS (`.s-select__icon { font-size: var(--semiui-comp-select-icon-size); width/height: ...}`), which is what we did, just upstream instead of in app code.

Either way, we'd ask for a **documented, deliberate answer** to "does this token size the glyph, the hit-box, or both?" for every icon-sizing token the library ships (`select.iconSize`, `accordion.chevronSize`, and anything similar already in the library or added later) — Accordion's doc comment ("Width and height of the expand/collapse indicator's **box**") suggests box-only was the intent, in which case the fix is a *new, separate* token for the glyph itself (e.g. `accordion.chevronIconSize`) rather than repurposing `chevronSize`; whatever's chosen, a custom icon needs *some* documented, working way to control its own rendered size once it's passed as a preset's `IconRef`. Right now there isn't one.

A quick audit for every other `width: var(--semiui-comp-*)` / `height: var(--semiui-comp-*)` rule that sits on an ancestor of an `<s-icon>` (rather than directly configuring `<s-icon>`'s own size) would find the rest; Carousel's `arrowSize` sizes the arrow *button*, not `.s-carousel__arrow-icon` (which has no size rule of its own and has always just taken the inherited default) — not broken by this report, but worth checking against the same question above.

---

## BUG-9 — Carousel `centerMode`: the floating arrows center on the wrong box when dots are shown

**Component:** Carousel, `centerMode`.

### What's wrong

```css
.s-carousel { position: relative; }
.s-carousel__body { display: flex; align-items: center; gap: ...; } /* no position set */
.s-carousel__arrow { position: absolute; top: 50%; transform: translateY(-50%); ... }
.s-carousel__dots { display: flex; ...; margin-top: var(--semiui-spacing-sm); }
```

```html
<div class="s-carousel" ...>
  <div class="s-carousel__body"> <!-- viewport (+ outside arrows, when used) --> </div>
  <!-- floating (non-outside) arrows, when rendered: siblings of body, inside .s-carousel -->
  <div class="s-carousel__dots">...</div>
</div>
```

```ts
/** Arrows flank the viewport only when asked to, and never in `centerMode`. */
protected readonly outsideArrows = computed(() => this.arrowsOutside() && !this.centerMode());
```

When `centerMode` is on, `outsideArrows` is forced `false` regardless of the `arrowsOutside` input, so the carousel always renders the plain (non-`--outside`) arrow buttons — which are DOM siblings of `.s-carousel__body` and `.s-carousel__dots`, not descendants of either. `.s-carousel__body` has no `position`, so these arrows' containing block for `top: 50%` is `.s-carousel` itself — **which also contains the dots row below the viewport**. With dots visible, `.s-carousel`'s height is `viewport height + gap + dot size`, so `top: 50%` lands past the viewport's own true vertical middle, and the arrows sit measurably off-center on the image (the amount scales with dot size + the gap above the dots; with Semi's own stock `carousel.dotSize`/`spacing.sm` defaults that's a small but real offset, and it grows with a larger `dotSize` or multi-row dot count).

For comparison, a carousel using the **outside** arrow variant doesn't have this problem, because those buttons render *inside* `.s-carousel__body` (which contains only the viewport, since dots are a sibling of `body`, not a child of it) — `top: 50%` there is already correct. The bug is specific to the combination this report asked for: `centerMode` + visible dots + arrows that float on top of the slides rather than flanking them — which, since `centerMode` unconditionally disables the outside-arrow path, is now the *only* arrow style `centerMode` can produce.

### How we worked around it (for now)

```css
.s-carousel[data-center] .s-carousel__dots {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  margin-top: 0;
  transform: translateY(calc(100% + var(--semiui-spacing-sm)));
}
```

Taking the dots out of flow (and re-placing them by their own height) restores `.s-carousel`'s measured height to just the viewport, so the arrows' `top: 50%` is correct again. This is scoped to `[data-center]` only, so it can't affect a future non-`centerMode` carousel.

### Suggested fix

The cleanest upstream fix is probably the one our own original fork used: give `.s-carousel__body` (or just the slice of `.s-carousel` above the dots row) its own positioning context for `centerMode`'s arrows specifically, e.g. render the floating arrows as descendants of `.s-carousel__body` (or wrap viewport+arrows in a `position: relative` element that excludes the dots) rather than as siblings of the dots row. Anything that stops the arrows' containing block from including `.s-carousel__dots` fixes it.

---

## Where these came from

Both were found by: building the app at the pre-migration commit and at the post-migration working tree, diffing every resolved `--semiui-comp-*` custom property between the two (which found nothing beyond the component tokens we meant to add — see our earlier migration), and then reading `@semiui/primitives/icon` and `@ng-icons/core`'s actual source to understand why two specific things still looked wrong even though every token matched. Nothing here was guessed from a screenshot; both are reproducible from the library's own shipped CSS/TS.

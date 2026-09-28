# Semi UI — Bugs & Enhancements Report

**Reported by:** Safeer landing page team (Semicolon)
**Semi UI version:** `1.1.3` (`@semiui/cli`, `@semiui/primitives`, `@semiui/theme`, `@semiui/tokens`, `@semiui/presets-semi`)
**Stack:** Angular 22, SSR enabled, light + dark mode, LTR + RTL (English / Arabic), Tailwind
**Components copied with the CLI (`preset: semi`, `prefix: s`):** accordion, button, carousel, error-message, select, tag, text-input, textarea, toggle-group

---

## 1. Why this report exists

Semi UI's promise is that we own the component code. We took that literally: to fit our design and to pass accessibility/SSR checks we edited **5 of the 9** components we use (accordion, carousel, select, textarea, toggle-group) plus one line in tag.

We don't want to keep those edits. Every edit is a fork we have to re-merge on each Semi UI release. The goal of this report is that **after you ship the fixes below we can delete our edited copies, re-add the stock components, and get the same result from `definePreset(...)` alone**, with no component code changes.

Each item says what is wrong, where, how we worked around it, and how to fix it in a way that:

- **keeps the current Semi look exactly as it is by default.** Every new token/input defaults to today's behavior.
- **is not specific to our design.** We describe a general capability (a token, an input, an icon slot), not "make it look like Safeer".
- **is reachable from the preset.** If it can't be a design token, we propose a preset-level default instead (see X-1).

### How to reproduce every diff in this report

The stock sources are in `src/original-components/`, ours are in `src/app/presentation/components/`.

```bash
diff -u --strip-trailing-cr src/original-components/<name> src/app/presentation/components/<name>
```

`button`, `error-message` and `text-input` are byte-identical to stock. That is the approach working as designed: everything we needed there came from tokens in `definePreset`. `tailwind.css` is also identical.

---

## 2. Summary

### Bugs

| ID | Component | Severity | One-liner |
|----|-----------|----------|-----------|
| BUG-1 | Select (and likely others, see list) | **High** | `document.addEventListener` in the constructor throws during SSR |
| BUG-2 | Toggle Group | **High (a11y)** | Icon-only items have no accessible name, and an empty `<span>` is still rendered |
| BUG-3 | Select | **Medium (a11y)** | `role="combobox"` trigger has no way to get an accessible name |
| BUG-4 | Carousel | **Medium (a11y)** | Autoplay only pauses on `mouseenter`; manual navigation never stops it |
| BUG-5 | Carousel | Medium | Pointer/drag handling: any mouse button drags, native text-select/image-drag fight the swipe, pointer captured eagerly |
| BUG-6 | Carousel, Accordion, Select | Medium (design-system) | One shared `chevronDown` icon key drives three different components, so restyling one changes all |
| BUG-7 | Select, Textarea | Medium (design-system) | Textarea and the Select dropdown panel reuse the single-line field radius token |

### Enhancements

| ID | Component | Adds |
|----|-----------|------|
| ENH-1 | Accordion | `separated` (card) layout, chevron tokens, chevron rotation and RTL mirroring |
| ENH-2 | Carousel | `centerMode` (peeking neighbours), arrow offset token, pill active dot, `autoplayResumeDelay` |
| ENH-3 | Select | Icon size, panel radius, option radius/padding tokens, icon slot |
| ENH-4 | Textarea | Own `radius` token (fallback to `input`), `resize` control |
| ENH-5 | Toggle Group | Optional label, `ariaLabel` per item (this is the fix for BUG-2) |
| ENH-6 | Tag | `iconSize` token |

### Cross-cutting

| ID | Proposal |
|----|----------|
| X-1 | Let a preset set **component defaults** (inputs), not only tokens |
| X-2 | Per-component **icon keys** with fallback, `currentColor` icons, RTL-flip metadata |
| X-3 | **No literal values in component CSS.** Every visual literal becomes a token with today's value as its default |
| X-4 | Ship a visual-regression check that the stock preset renders identically after these changes |

---

## 3. Bugs

### BUG-1 — Select touches `document` at construction time (SSR crash)

**File:** `select/select.component.ts` (constructor)

```ts
constructor() {
  super();
  const onScroll = (event: Event) => this.onAnyScroll(event);
  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  this.destroyRef.onDestroy(() => document.removeEventListener('scroll', onScroll, { capture: true }));
}
```

`document` doesn't exist on the server, so rendering any page that contains `<s-select>` under Angular SSR/prerender throws a `ReferenceError`.

**Our fix:** wrap the registration in `afterNextRender(...)`, which only runs in the browser. (Your own `marquee.component.ts` already uses `afterNextRender`, so there is precedent in the library.)

**Suggested fix:**
1. Register the listener with `afterNextRender`, or inject `DOCUMENT` and guard with `isPlatformBrowser`.
2. Better: attach the capture-phase scroll listener **only while the panel is open** and remove it on close. Today every Select instance keeps a global capture-phase scroll listener for its whole lifetime, even when closed. A page with several selects pays for that on every scroll of anything.

**Same pattern elsewhere (not verified by us, please audit).** We don't use these components, so we haven't confirmed whether each one runs at construction (which crashes SSR) or only inside an open handler (which is fine):

| File | Line | Code |
|------|------|------|
| `date-picker/date-picker.component.ts` | 167 | `signal(window.innerWidth <= MOBILE_BREAKPOINT_PX)` (a field initializer, so it runs at construction) |
| `auto-complete/auto-complete.component.ts` | 281 | `document.addEventListener('scroll', …)` |
| `cascade-select/cascade-select.component.ts` | 386 | same |
| `multiselect/multiselect.component.ts` | 386 | same |
| `color-picker/color-picker.component.ts` | 318 | same |
| `context-menu/context-menu.component.ts` | 214 | same |
| `popover/popover.component.ts` | 200 | same |
| `tooltip/tooltip.directive.ts` | 94 | same |

Line numbers refer to the stock 1.1.3 sources. `date-picker` line 167 is a definite construction-time access. The others need a look at whether they are called from the constructor or from an open handler.

---

### BUG-2 — Toggle Group: icon-only items have no accessible name

**Files:** `toggle-group.component.ts`, `toggle-group.component.html`

`ToggleGroupItem.label` is a required `string`, and the template always renders `<span class="s-toggle-group__label">{{ item.label }}</span>`. For an icon-only segment (e.g. a light/dark switch) there is nothing to give a `<button>` its accessible name. Lighthouse/axe report `button-name`. Passing `label: ''` also leaves an empty `<span>` in the flex row, which adds a stray `gap`.

**Our fix (small, general):**

```ts
export interface ToggleGroupItem<TValue = unknown> {
  label: string;
  value: TValue;
  icon?: IconRef;
  /** Accessible name for icon-only segments (leave `label` empty). */
  ariaLabel?: string;
  disabled?: boolean;
}
```

```html
<button ... [attr.aria-label]="item.ariaLabel ?? null" ...>
  @if (item.icon) { <s-icon class="s-toggle-group__icon" [ref]="item.icon" /> }
  @if (item.label) { <span class="s-toggle-group__label">{{ item.label }}</span> }
</button>
```

**Suggested fix:** take the change above as is. Optionally make `label` optional and warn in dev mode when an item has neither `label` nor `ariaLabel`.

This is a pure addition, and existing usage is unaffected.

---

### BUG-3 — Select: trigger cannot get an accessible name

**Files:** `select.component.ts`, `select.component.html`

The trigger is `<button role="combobox" …>`. When the select has no external `<label for>` (very common; ours has a visible `<label>` that isn't programmatically tied to it), its name comes only from the placeholder/value text, so axe flags the ARIA input field as unnamed.

**Our fix:** add an input and bind it.

```ts
ariaLabel = input('');
```
```html
[attr.aria-label]="ariaLabel() || placeholder() || null"
```

**Suggested fix (a bit more careful than ours):**
- Add both `ariaLabel` and `ariaLabelledby` inputs.
- Don't fall back to the placeholder when a value is selected. `aria-label` overrides the button's text content, so with our fallback a screen reader reads the placeholder instead of the selected option in that case. We didn't hit it because we always pass `ariaLabel`, but the fallback we wrote isn't something we'd recommend upstream.
- Consider wiring the trigger to a `<label for>` / `aria-labelledby` automatically when the Select is inside a form-field wrapper.

Note that Select's own `clear` control already has `aria-label="Clear selection"` hard-coded in English. That string should be an input or come from an i18n provider (we're bilingual), but that's a separate issue.

---

### BUG-4 — Carousel: autoplay can't be stopped by keyboard or touch, and manual navigation doesn't pause it

**Files:** `carousel.component.html`, `carousel.component.ts`

Stock behavior: autoplay pauses on `mouseenter` only. If a keyboard user tabs into the carousel, or a touch user swipes/taps arrows, autoplay keeps advancing and the slide changes under them. This fails WCAG 2.2.2 (Pause, Stop, Hide) and is very noticeable on mobile.

**Our fix:**
- New input `autoplayResumeDelay` (ms, default `10000`, `0` = disabled). Any manual navigation (arrows, dots, keyboard, swipe, click on a slide) pauses autoplay and restarts it after the delay.
- Implemented with a `userInteracted` signal plus a timer, cleaned up on destroy.
- The public handlers were split into `userNext` / `userPrevious` / `userGoTo` (they mark the interaction and then call the original methods, which autoplay still uses).

**Suggested fix:** the above, plus what we did not do:
- pause on `focusin` (and resume on `focusout`);
- honor `prefers-reduced-motion: reduce` by not autoplaying at all;
- expose an optional visible pause/play button.

---

### BUG-5 — Carousel: pointer/drag handling

**Files:** `carousel.component.ts`, `carousel.component.css`

Problems we hit with the stock drag:

1. **Any mouse button starts a drag.** `onPointerDown` doesn't check `event.button`, so a right or middle click starts a swipe.
2. **Native selection/drag fights the swipe.** Dragging over text starts a text selection, and dragging an `<img>` starts the browser's native image drag, which then fires `pointercancel`. Stock CSS has nothing that prevents this.
3. **Capture is taken at `pointerdown` on `event.target`.** Capturing before we know it's a swipe changes where the follow-up `click` is dispatched, which is risky for buttons/links inside slides (our slides contain buttons).

**Our fix:**

```css
.s-carousel__viewport { user-select: none; cursor: grab; }
.s-carousel__viewport:active { cursor: grabbing; }
.s-carousel__slide img { -webkit-user-drag: none; }
```
```ts
protected onPointerDown(event: PointerEvent): void {
  if (event.pointerType === 'mouse' && event.button !== 0) return;   // primary button only
  this.didDrag = false;
  this.pointerCaptured = false;
  ...
}
protected onPointerMove(event: PointerEvent): void {
  ...
  if (Math.abs(delta) > 5) {
    this.didDrag = true;
    if (!this.pointerCaptured) {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); // on the viewport, and only once it is a real drag
      this.pointerCaptured = true;
    }
  }
}
```

**Suggested fix:** the same three points. Only capture once movement exceeds a small threshold and capture on `currentTarget`. Track a `didDrag` flag so a click that ends a swipe can be ignored.

We are less sure about point 3 than about points 1 and 2. We changed it while debugging clicks on buttons inside slides, and it made the problem go away. We did not build a minimal reproduction of the stock behavior.

---

### BUG-6 — One `chevronDown` icon key is shared by Carousel, Accordion and Select

**Files:** `carousel.component.html`, `accordion.component.html`, `select.component.html`; `IconTokens` in `@semiui/tokens`

`IconTokens.chevronDown` is documented as *"Select's trigger icon, and any other component-level dropdown affordance"*, but it is also what Carousel uses for its prev/next arrows (rotated ±90° in CSS) and what Accordion uses for its expand indicator (rotated 180°). So a design that wants a different arrow for the carousel than for the select **cannot express it in the preset**. Changing the icon changes all three, and each component's CSS silently assumes a vertical chevron glyph.

**Our workaround:** in the preset we replaced `chevronDown` with our carousel arrow. To stop Select and Accordion picking it up, we **removed the `<s-icon>` from both and hard-coded inline SVGs** in their templates. That's a big part of why we forked them (see ENH-1, ENH-3).

**Suggested fix:** see X-2, per-component icon keys with a fallback to `chevronDown`, so stock presets are unaffected.

---

### BUG-7 — Textarea and the Select dropdown reuse the single-line field radius

**Files:** `textarea.component.css`, `select.component.css`

- Textarea uses `--semiui-comp-input-radius`. A pill-shaped input (radius ≈ `2.875rem` or `9999px`) makes a 5-row textarea look like a blob; you want a different radius there. No `textarea.*` tokens exist, so it always follows `input.radius`.
- The Select panel uses `--semiui-comp-select-radius`, the same token as the trigger. With a pill trigger, the dropdown list gets the same huge radius and its options clip against the corners.
- Select options have hard-coded `padding: var(--semiui-spacing-sm) var(--semiui-spacing-md)` and `border-radius: var(--semiui-radius-sm)` with no tokens at all.

**Our workaround (hard-coded, which is the wrong direction):**

```css
/* textarea */ border-radius: 1.625rem;
/* select panel */ border-radius: 1.625rem;
/* select option */ padding: var(--semiui-spacing-sm) 0.9rem; border-radius: 1.375rem;
```

**Suggested fix:** new tokens, see ENH-3 and ENH-4.

---

## 4. Enhancements

For each item, "Default" is the value that reproduces today's stock Semi rendering, so existing users see no change.

### ENH-1 — Accordion

**Files changed by us:** `accordion.component.{css,html,ts}`

What we wanted, in general terms: **separated cards** instead of one joined list, and a **round, filled, directional arrow button** instead of a plain chevron.

| Local change | What it does | Why it's a design-agnostic feature |
|--------------|--------------|------------------------------------|
| `.s-accordion` gets `gap: 0.5rem`; the outer border/radius/`overflow:hidden` moved onto each `.s-accordion__item` | Each item becomes its own card | A "separated" layout is a common accordion style |
| Expanded chevron: `rotate(-90deg)` instead of `rotate(180deg)` | Different arrow needs a different rotation | The rotation depends on the glyph |
| Chevron becomes a `2.5rem` filled circle using `--semiui-color-primary` | Icon button look | Sizing/background/radius should be tokens |
| RTL: `scaleX(-1)` (plus `scaleX(-1) rotate(-90deg)` when open) | A diagonal arrow must mirror in RTL. A vertical chevron doesn't. | Directional glyphs need a mirroring hook (X-2) |
| Inline `<svg stroke="#F9FAFB">` replaces `<s-icon [ref]="icons.chevronDown">` | Independent from the carousel/select arrow | See BUG-6. Hard-coded hex stroke also **breaks dark mode/theming** (X-2) |
| Label `font-size: 1.25rem; font-weight: 500` | | Already reachable through existing `accordion.fontSize` / `fontWeight`; our CSS literals are redundant (see note below) |
| `background: transparent` on header and on hover | | Only needed because we moved the background to the item (see note below) |

**Notes we found while writing this up (fixes on our side, not requests):**
- The label `font-size`/`font-weight` overrides aren't needed. The header already reads `--semiui-comp-accordion-font-size/-weight`, and the label inherits from the header. We'll drop them.
- Moving the background onto `.s-accordion__item` and forcing the header/hover to `transparent` made the `headerBackground(Hover)` tokens dead in our fork. It wasn't necessary: with `overflow: hidden` + `border-radius` on the item, a background on the header is clipped to the card. A preset can simply set `headerBackgroundHover` equal to `headerBackground` for a no-hover-change look. **You don't need to add anything for this**, but the "separated" layout should keep header tokens working.

**Proposed API:**

```ts
// input, plus a preset-level default (X-1)
variant = input<'joined' | 'separated'>('joined');     // default = stock look
```

New tokens (stock defaults in brackets):

| Token | Purpose | Default (= stock) |
|-------|---------|-------------------|
| `accordion.gap` | Space between items when `variant="separated"` | `0.5rem` (ignored for `joined`) |
| `accordion.itemBorder`, `accordion.itemRadius` | Per-item border/radius in `separated` | falls back to `accordion.border` / `accordion.radius` |
| `accordion.chevronSize` | Size of the indicator | `1rem` |
| `accordion.chevronBackground`, `chevronForeground`, `chevronRadius` | Optional filled/round indicator | `transparent` / `currentColor` / `0` |
| `accordion.chevronRotationExpanded` | Rotation when open | `180deg` |

Icon: read `icons.accordionChevron ?? icons.chevronDown` (see X-2). For RTL, mirror when the `IconRef` is flagged `flipInRtl` (see X-2) instead of adding accordion-specific `:host-context([dir='rtl'])` rules.

**Stock look preserved:** `variant` defaults to `joined`, and the new tokens default as above.

---

### ENH-2 — Carousel

**Files changed by us:** `carousel.component.{css,html,ts}`

| Local change | Feature |
|--------------|---------|
| `centerMode` input and CSS | The active slide is centered at full size; previous/next **peek in, scaled down, blurred and faded**; slides further away are hidden; clicking a neighbour activates it |
| `centerSlideWidth` (default `75`, % of viewport) | Slide width in center mode |
| `centerGap` / `centerOverlap` (default `0.75`) | Spacing between slides. Implemented with `margin-inline-end` so it can go **negative**, tucking neighbours under the active one (the `gap` property can't) |
| `perView` computed (`1` in center mode) | Center mode forces one active slide; `maxIndex` and the transform use it |
| Center-mode `trackTransform` | Centers the active slide: `translateX(calc(N * (width% + var(--slide-gap)) - centered% + dragpx))` |
| Center mode: outside arrows become `position:absolute`, floating over the neighbours | |
| `.s-carousel__arrow--prev/next` `inset-inline-*: 4.75rem` | **Hard-coded arrow offset** (was `var(--semiui-spacing-sm)`) |
| Dots: `<button>` → `<a>`; the active dot is a **pill** (`width: 1.75rem`) instead of `scale(1.2)` | Pill-shaped active indicator (see the note on `<a>` in Appendix A) |
| `autoplayInterval` default `4000` → `2000` | Local preference only; see Appendix A |
| `autoplayResumeDelay` | BUG-4 |
| Drag hardening | BUG-5 |

**Proposed API:**

Inputs (also settable as preset defaults, X-1): `centerMode`, `centerSlideWidth`, `centerGap`, `centerOverlap`, `autoplayResumeDelay`.

New tokens (stock defaults in brackets):

| Token | Purpose | Default (= stock) |
|-------|---------|-------------------|
| `carousel.arrowOffset` | Inset of the floating arrows from the edge | `{spacing.sm}` |
| `carousel.dotActiveWidth` | Width of the active dot | `{carousel.dotSize}` |
| `carousel.dotActiveScale` | Scale of the active dot | `1.2` |
| `carousel.centerInactiveScale` | Scale of peeking slides | `0.8` |
| `carousel.centerInactiveBlur` | Blur of peeking slides | `4px` |
| `carousel.centerInactiveOpacity` | Opacity of peeking slides | `0.6` |
| `carousel.slideTransition` | Duration/easing of the scale/blur/opacity transitions (respecting `prefers-reduced-motion`) | `0.3s ease` |

**Requirements for a general center mode:** RTL support (our version flips the sign in `trackTransform` and `margin-inline-end`, and uses logical properties), drag support (`dragOffset` is added to the transform), and `aria-hidden` on non-visible slides. Two accessibility caveats on our version, which we'd like handled properly upstream:
- Click-to-activate neighbours is a mouse/touch affordance only. The neighbours are `aria-hidden` and not focusable, so keyboard users depend on arrow keys/dots. That's acceptable, but it should be documented.
- Slides outside the active window get `aria-hidden="true"` (stock behavior too), but anything focusable inside them (for example a button in the slide) stays in the tab order. Hidden-but-focusable is an a11y bug. Use `inert` on non-active slides instead of, or together with, `aria-hidden`. We haven't fixed this locally.

---

### ENH-3 — Select

**Files changed by us:** `select.component.{css,html,ts}`

| Local change | Feature / token needed |
|--------------|------------------------|
| `.s-select__icon` `1em` → `1.25em` | `select.iconSize` token (default `1em`) |
| Inline `<svg fill="#919EB0">` instead of `<s-icon [ref]="icons.chevronDown">` | Icon slot + `currentColor` (BUG-6, X-2). The hard-coded fill also ignores dark mode. |
| `.s-select__panel` `border-radius: 1.625rem` | `select.panelRadius` (default `{select.radius}`) |
| `.s-select__option` `border-radius: 1.375rem`; `padding-inline: 0.9rem` | `select.optionRadius` (default `{radius.sm}`), `select.optionPaddingX` (default `{spacing.md}`), `select.optionPaddingY` (default `{spacing.sm}`) |
| `ariaLabel` input | BUG-3 |
| SSR-safe scroll listener | BUG-1 |
| Formatting-only changes in `select.component.html` | Ignore (Prettier line wrapping) |

**Icon slot:** `icons.selectChevron ?? icons.chevronDown`; the `.s-select__icon` open-state rotation should also be a token (`select.iconRotationOpen`, default `180deg`) if a different glyph needs a different rotation.

---

### ENH-4 — Textarea

**File changed by us:** `textarea.component.css`

```css
- border-radius: var(--semiui-comp-input-radius);
+ border-radius: 1.625rem;
...
+ resize: none;
```

**Proposed:**
- `textarea.radius` token, default `{input.radius}`, so nothing changes unless a preset sets it (BUG-7).
- Control over `resize`: either a `resize` input (`'none' | 'vertical' | 'horizontal' | 'both'`, default `'vertical'`, and `'none'` is already forced by `autoResize`), or a `textarea.resize` token. Since CSS `resize` is a plain property, a token works fine.

Add `textarea.paddingX/Y/fontSize` (falling back to `input.*`) while you're there. We didn't need them, but a multi-line field commonly wants different padding from a single-line one.

---

### ENH-5 — Toggle Group

Covered by BUG-2: `ariaLabel` per item and an optional `label`. Nothing else changed in this component's code. **Everything else about our toggle group look (pill shape, sizes, colors) already worked from `definePreset` tokens (`toggleGroup.*`), which is exactly the outcome we want for the other components.**

---

### ENH-6 — Tag

**File changed by us:** `tag.component.css` (one rule)

```css
.s-tag__icon {
- width: 0.875em;
- height: 0.875em;
+ width: 0.5rem;
+ height: 0.5rem;
}
```

We use a small 8px dot as the tag icon and the `0.875em` default scales with font size. **Proposed:** `tag.iconSize` token, default `0.875em`. That's the only reason we forked `tag`.

---

## 5. Cross-cutting proposals

### X-1 — Component defaults in the preset (not only tokens)

Several of our needs are **structural or behavioral defaults**, not colors/sizes, so tokens can't express them:

- `accordion` → `variant: 'separated'`
- `carousel` → `centerMode: true`, `autoplayInterval: 2000`, `centerSlideWidth`, `autoplayResumeDelay`
- (any component) → default size/variant

Today these can only be set per usage (`<s-carousel centerMode …>`), which is fine for one page, but it means a "look" that includes structure can't live in the preset. Proposal: a preset-level `defaults` block that supplies input defaults, overridable per instance:

```ts
definePreset(Semi, {
  defaults: {
    accordion: { variant: 'separated' },
    carousel:  { centerMode: true, autoplayInterval: 2000 },
  },
});
```

Implementation sketch: each input reads `input(inject(SEMIUI_DEFAULTS)?.carousel?.centerMode ?? false)`. Inputs stay the source of truth, and the preset only changes the initial value.

### X-2 — Icons: per-component keys, `currentColor`, RTL flip

1. **Per-component icon keys with fallback.** Add keys such as `accordionChevron`, `carouselPrev`, `carouselNext`, `selectChevron`, each falling back to `chevronDown` so the stock preset is unchanged. This directly fixes BUG-6.
2. **Icons must use `currentColor`.** The stock chevron is fine, but our own icons (which we had to inline) used literal hex (`#F9FAFB`, `#919EB0`) and therefore don't follow dark mode/theme foreground. Recommend the docs say custom `IconRef` SVGs should use `currentColor`, and that component CSS sets `color` from a token.
3. **Direction metadata on `IconRef`.** e.g. `{ type: 'svg', markup, flipInRtl?: boolean }`. Components apply `transform: scaleX(-1)` under `:dir(rtl)` when set. Carousel already does something like this with `:dir(rtl)` on its arrow icons; Accordion/Select should use the same mechanism rather than each inventing their own.
4. **Rotation as a token** where a component rotates an icon by state (accordion open, select open, carousel prev/next), because the right angle depends on which glyph the preset supplies.

### X-3 — No literal visual values in component CSS

Every place we edited was a literal that should have been a token:

| Literal in stock CSS | Should be |
|----------------------|-----------|
| `.s-select__icon { 1em }` | `select.iconSize` |
| `.s-select__option { spacing-sm/md; radius-sm }` | `select.optionPadding*`, `select.optionRadius` |
| `.s-tag__icon { 0.875em }` | `tag.iconSize` |
| `.s-accordion__chevron { 1rem; rotate(180deg) }` | `accordion.chevronSize`, `accordion.chevronRotationExpanded` |
| `.s-carousel__arrow--prev/next { inset: spacing-sm }` | `carousel.arrowOffset` |
| `.s-carousel__dot[aria-selected] { scale(1.2) }` | `carousel.dotActiveScale/Width` |
| `.s-textarea { resize: vertical }` | `textarea.resize` |

A quick audit for remaining bare `rem`/`em`/`px` values and `spacing-*`/`radius-*` references that aren't behind a `--semiui-comp-*` variable would find the rest.

### X-4 — Guarding "no change for existing users"

Since every proposal above defaults to today's values, please add a visual-regression snapshot of the stock `Semi` preset for accordion, carousel, select, textarea, tag and toggle-group. It should be unchanged before and after this work.

---

## 6. Migration map: what replaces each of our local edits once these ship

Names below are the ones proposed in this report. If you choose different names, we'll adapt the preset.

```ts
export const SafeerPreset = definePreset(Semi, {
  // ...existing primitives / semantic ...

  defaults: {                                   // X-1
    accordion: { variant: 'separated' },
    carousel:  { centerMode: true, autoplayInterval: 2000, autoplayResumeDelay: 10000 },
  },

  icons: {                                      // X-2
    chevronDown:      { /* unchanged stock chevron */ },
    accordionChevron: { type: 'svg', markup: '…currentColor…', flipInRtl: true },
    carouselPrev:     { type: 'svg', markup: '…currentColor…' },
    carouselNext:     { type: 'svg', markup: '…currentColor…' },
    selectChevron:    { type: 'svg', markup: '…currentColor…' },
  },

  components: {
    accordion: {
      gap: '0.5rem',
      itemRadius: '1.5rem',
      chevronSize: '2.5rem',
      chevronRadius: '9999px',
      chevronBackground: '{primary}',
      chevronForeground: '{primaryForeground}',
      chevronRotationExpanded: '-90deg',
      headerBackgroundHover: '{slate.50}',       // same as headerBackground: no hover change
    },
    carousel: {
      arrowOffset: '4.75rem',
      dotActiveWidth: '1.75rem',
      dotActiveScale: '1',
    },
    select: {
      iconSize: '1.25em',
      panelRadius: '1.625rem',
      optionRadius: '1.375rem',
      optionPaddingX: '0.9rem',
    },
    textarea: { radius: '1.625rem', resize: 'none' },
    tag: { iconSize: '0.5rem' },
    // toggleGroup, button, input: already preset-only today
  },
});
```

| Our local edit | Replaced by |
|----------------|-------------|
| accordion: separated cards + round arrow button, RTL mirroring | `defaults.accordion.variant`, `accordion.gap/itemRadius/chevron*`, `icons.accordionChevron` (`flipInRtl`) |
| carousel: center mode, arrow offset, pill dot, autoplay tweaks, drag fixes | `defaults.carousel.*`, `carousel.arrowOffset/dotActive*`, BUG-4 and BUG-5 fixes upstream |
| select: SSR fix, `ariaLabel`, icon, panel/option radius | BUG-1 and BUG-3 fixes, `select.iconSize/panelRadius/option*`, `icons.selectChevron` |
| textarea: radius, `resize: none` | `textarea.radius`, `textarea.resize` |
| toggle-group: `ariaLabel`, optional label | BUG-2 fix upstream (no preset needed) |
| tag: icon size | `tag.iconSize` |

---

## 7. Appendix A — local changes we are **not** asking you to adopt

We are listing these for transparency. They are either purely our preference, or we don't have a good justification for them and plan to revert them on our side.

1. **`autoplayInterval` default `4000` → `2000`** (carousel). A preference, and 2s is too fast for many users. It's already an input, so it belongs in `defaults` (X-1), not in the library's default.
2. **Select placeholder rendered from CSS** (`<span class="s-select__placeholder" [attr.data-placeholder]="placeholder()">` + `::before { content: attr(data-placeholder) }`). We can't reconstruct why we made this change and it has downsides (not real text: not selectable, not translatable by browser translation, inconsistent in the accessibility tree). **We don't recommend it; we'll revert.**
3. **Carousel dots changed from `<button>` to `<a type="button">`** with no `href`. That's an accessibility regression: an `<a>` without `href` isn't keyboard-focusable, and `type` doesn't apply to it. **Keep `<button>`**; we'll revert on our side. The active-pill look only needs the CSS in ENH-2.
4. **Select `aria-label` falling back to the placeholder.** See BUG-3 for why not to do that.
5. **Accordion CSS literals** (`font-size: 1.25rem`, `font-weight: 500` on the label; `transparent` header/hover). Redundant, as explained under ENH-1.

## 8. Appendix B — formatting-only diffs

`accordion.component.html` and `select.component.html` show extra changes that are just Prettier reflowing long lines (the multi-line `[ngTemplateOutletContext]`, `.s-select__clear` span attributes, etc.). They carry no behavior change. Use `diff -w` or ignore them.

## 9. Appendix C — scope and limits of this report

- Based on a file-by-file diff of stock 1.1.3 vs. our copies. The repository has no per-change history for these edits (they were made during development sessions, and the repo history is too coarse to attribute them), so "why" statements come from reading the code and from what we needed, not from commit messages. Where we aren't sure (Appendix A items 2 and 3, BUG-5 point 3), we say so.
- We only exercised the components listed at the top. The SSR audit list in BUG-1 is a pointer, not a confirmed bug list.
- We have not implemented `defaults`, per-component icon keys, or the new tokens. They are proposals, so names and shapes are open to your conventions.

# Semi UI — Update Notice

|                    |                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **Release**        | 1.2.0 (minor). Follows 1.1.3.                                                             |
| **Date**           | 28 September 2026                                                                         |
| **Responds to**    | *Semi UI — Bugs & Enhancements Report*, submitted by the Safeer landing-page team         |
| **Packages**       | `@semiui/tokens`, `@semiui/theme`, `@semiui/primitives`, `@semiui/presets-semi`, `@semiui/cli` (the six other presets follow with an automatic patch bump) |
| **Breaking changes** | None                                                                                    |

---

## 1. Summary

This release implements every item in the Safeer report: seven bugs, six component enhancements and four
cross-cutting proposals. Its purpose is the one the report set out: after upgrading, a design that
previously required forked components can be expressed entirely in `definePreset(...)`, and the forks can
be deleted.

Two guarantees hold throughout:

- **Stock Semi is visually unchanged.** Every new token and input defaults to the value that was previously
  hard-coded. We compared computed styles of the affected components before and after, in light and dark
  mode and in LTR and RTL, and the only differences are the new demos and the intended interaction fixes
  listed in section 4.
- **Nothing is required of you to upgrade.** No API was removed or renamed, and no icon needs registering.

### At a glance

| Area                        | What changed                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| Server-side rendering       | Nine components no longer touch `document` / `window` when constructed                              |
| Accessibility               | Nameable icon-only toggle segments and Select triggers; safer carousel autoplay; inert hidden slides; labelled Float Label |
| Design system               | About 35 new component tokens replace hard-coded literals; per-component icons; RTL icon mirroring        |
| Structure in the preset     | New `defaults` block sets component input defaults (e.g. separated accordion, centred carousel)      |
| New features                | Accordion `separated` variant, Carousel `centerMode` and pause/play button                          |

---

## 2. Upgrading

```bash
# 1. Update the packages
npm install @semiui/tokens@latest @semiui/theme@latest @semiui/primitives@latest @semiui/presets-semi@latest @semiui/cli@latest

# 2. Preview what the new recipes change in the components you copied in
npx semiui update --dry-run

# 3. Apply. Files you edited are merged three-way; files you have not edited are simply updated
npx semiui update
```

`semiui update` preserves local edits by merging them against the version you originally installed. If you
maintained forks of accordion, carousel, select, textarea or toggle-group purely to work around the issues
in the report, the better route is to **discard those edits and take the stock components**, then move the
design into your preset (section 6). `npx semiui diff <component>` shows what the library changed since you installed a component; your own edits are visible in version control.

Components you have not copied are unaffected.

---

## 3. Bug fixes

| ID     | Component(s)                          | Fix |
| ------ | ------------------------------------- | --- |
| BUG-1  | Select, Multiselect, Auto Complete, Cascade Select, Color Picker, Context Menu, Popover, Tooltip, Date Picker | **SSR crash.** Each registered a capture-phase `document` scroll listener from its constructor, and Date Picker read `window.innerWidth` in a field initializer. The listener is now attached only while the panel is open (Tooltip: only while a hover is in progress) and only in the browser. A closed instance no longer costs anything per scroll. |
| BUG-2  | Toggle Group                          | Icon-only segments can set `ariaLabel`. The label element is no longer rendered when `label` is empty, which removes the stray flex gap. In development, an item with neither `label` nor `ariaLabel` logs a warning. |
| BUG-3  | Select                                | New `ariaLabel`, `ariaLabelledby`, `inputId` and `clearLabel` inputs. There is no placeholder fallback: `aria-label` names the control while the selected option remains its value. The clear control's name is no longer hard-coded English. |
| BUG-4  | Carousel                              | Autoplay pauses while the pointer is over the carousel, while **keyboard** focus is inside it, and for `autoplayResumeDelay` ms (default 10 000) after any manual navigation. It does not run under `prefers-reduced-motion: reduce`. An optional pause/play button stops it outright. |
| BUG-5  | Carousel                              | Dragging ignores non-primary mouse buttons, no longer fights text or native image drag, and captures the pointer only once the gesture is a real drag, so buttons and links inside slides receive their clicks. |
| BUG-6  | Accordion, Carousel, Select           | The three no longer share one icon. Optional slots `accordionChevron`, `carouselPrev`, `carouselNext` and `selectChevron` each fall back to `chevronDown`. |
| BUG-7  | Textarea, Select                      | Textarea has its own geometry tokens. The Select panel and options have their own radius and padding tokens (section 5). |

### Also fixed along the way

- **Select and Multiselect ignored `select.panelMaxHeight`.** The token existed and Auto Complete and
  Cascade Select honoured it, but Select and Multiselect used a literal `16rem`. They now read the token
  (default unchanged).
- **Hidden-but-focusable carousel content.** Slides outside the visible window were `aria-hidden` only, so a
  button inside one stayed in the tab order. They are now also `inert`.

---

## 4. Behaviour changes to be aware of

None of these alter how the components look. They are the intended effect of the fixes above.

| Change | Effect |
| ------ | ------ |
| Carousel autoplay pauses after manual navigation | A user who clicks an arrow, a dot or swipes now gets 10 s before autoplay resumes. Set `autoplayResumeDelay` to `0` to restore the previous behaviour, where autoplay ignored manual navigation. |
| Carousel autoplay stops under `prefers-reduced-motion` | Autoplay does not start for visitors who request reduced motion. |
| Carousel viewport is `user-select: none` with a `grab` cursor | Text inside a slide can no longer be selected by dragging. |
| Carousel slides outside the view are `inert` | Focus cannot reach controls inside off-screen slides. |
| Float Label now names its control | The label gains `for` (native input, textarea, or the Select trigger) or the control gains `aria-labelledby` (Multiselect). A control that already has its own `id`-based name, `aria-label` or `aria-labelledby` is left alone. |
| Select family reads new tokens | Values are identical by default; presets that override `select.*` continue to apply as before. |

---

## 5. New capabilities

### 5.1 Component defaults in the preset (X-1)

Some parts of a design are structural, not stylistic. A preset can now set the initial value of component
inputs:

```ts
definePreset(Semi, {
  defaults: {
    accordion: { variant: 'separated' },
    carousel: { centerMode: true, autoplayInterval: 2000 },
  },
});
```

An input bound on an instance always overrides the default, and a component the preset does not mention
behaves exactly as before. Components read their entry with `injectComponentDefaults('carousel')` from
`@semiui/theme`, passing the result as the input's initial value; the input remains the source of truth.
Accordion and Carousel are wired today, and the mechanism accepts any component.

### 5.2 Per-component icons, `currentColor`, RTL mirroring (X-2)

| Slot                | Used by                          | Falls back to                          |
| ------------------- | -------------------------------- | -------------------------------------- |
| `accordionChevron`  | Accordion expand indicator       | `chevronDown`                          |
| `carouselPrev`      | Carousel previous arrow          | `chevronDown`, turned by a token       |
| `carouselNext`      | Carousel next arrow              | `chevronDown`, turned by a token       |
| `selectChevron`     | Select, Multiselect, Cascade Select trigger | `chevronDown`               |
| `carouselPause`, `carouselPlay` | Carousel autoplay button | A built-in glyph (nothing to register) |

- `IconRef` accepts `flipInRtl: true`. The icon then mirrors itself under a right-to-left direction. Use it
  for directional glyphs; leave it off for symmetric or vertical ones.
- Inline SVG should paint with `currentColor`, never a literal colour, so it follows the component's
  foreground token, dark mode and every preset. This is now stated in the API docs and the theming guide.
- Rotation is a token wherever a component turns an icon by state: `accordion.chevronRotationExpanded`,
  `select.iconRotationOpen`, `carousel.arrowIconRotationPrev` / `Next`. A dedicated `carouselPrev` or
  `carouselNext` icon is drawn facing the right way and receives no rotation. When a mirrored icon also
  rotates, the rotation is negated under RTL so the composition mirrors correctly.

### 5.3 Accordion (ENH-1)

- `variant`: `'joined'` (default) or `'separated'`, where every item is its own bordered, rounded card.
  The header tokens continue to work in the separated layout.
- Tokens: `gap`, `itemBorder`, `itemRadius`, `chevronSize`, `chevronBackground`, `chevronForeground`,
  `chevronRadius`, `chevronRotationExpanded`.

### 5.4 Carousel (ENH-2)

- `centerMode`: the active slide is centred at full size and its neighbours peek in, scaled, blurred and
  faded. Clicking a neighbour activates it. Works with drag and with RTL. Inputs: `centerSlideWidth`
  (default `75`, percent of the viewport) and `centerGap` (any CSS length; negative tucks neighbours under
  the active slide).
- `showAutoplayToggle`, `pauseLabel`, `playLabel`: a visible pause/play control. Unlike the timed pauses,
  it holds until pressed again.
- `autoplayResumeDelay` (BUG-4).
- Tokens: `arrowOffset`, `dotActiveWidth`, `dotActiveScale`, `centerInactiveScale`, `centerInactiveBlur`,
  `centerInactiveOpacity`, `slideTransition`, `arrowIconRotationPrev`, `arrowIconRotationNext`. Motion is
  removed under `prefers-reduced-motion`.

### 5.5 Select and its family (ENH-3)

Tokens, shared by Select, Multiselect, Auto Complete and Cascade Select where the part exists: `iconSize`,
`iconRotationOpen`, `triggerGap`, `panelRadius`, `listPadding`, `optionRadius`, `optionPaddingX`,
`optionPaddingY`, `opacityLoading`.

`panelRadius` follows the trigger's `radius` until set, so a pill-shaped trigger can keep a sensible list.
The family shares these tokens deliberately: a preset that restyles the Select panel should not leave the
Multiselect panel behind.

### 5.6 Textarea (ENH-4)

A new `textarea` component entry: `radius`, `paddingX`, `paddingY`, `fontSize`, `resize`, `counterInset`.
Each defaults to the matching `input` token, so a preset that squares its inputs squares its textareas
without saying so twice, and setting `textarea.radius` leaves `input.radius` alone.

### 5.7 Toggle Group (ENH-5) and Tag (ENH-6)

- Toggle Group: `ToggleGroupItem.ariaLabel`, and an empty `label` renders no label element.
- Tag: `gap`, `iconSize` (default `0.875em`), `removeIconSize`, `removeOpacity`.

### 5.8 No literals in component CSS (X-3)

Every literal named in the report is now a token, and we audited the six components in scope plus the
Select family. Additional literals found and tokenised: Select and Multiselect list `max-height`, trigger
gap, list padding and loading opacity; Cascade Select loading opacity; Tag gap and remove-button size and
opacity; the Textarea counter offset.

### 5.9 Regression guard (X-4)

`libs/presets/semi/src/lib/semi.spec.ts` now pins the resolved value of every formerly hard-coded token
against the literal it replaced. The existing specs also fail if a token exists that no stylesheet reads,
or a stylesheet reads a variable no preset defines.

---

## 6. Migrating a forked design to a preset

The mapping below uses the names that shipped. It replaces the edits described in the report; the
accordion, carousel, select, textarea, tag and toggle-group forks can then be deleted.

```ts
import { definePreset } from '@semiui/tokens';
import { Semi } from '@semiui/presets-semi';

export const SafeerPreset = definePreset(Semi, {
  // ...existing primitives / semantic / dark

  defaults: {
    accordion: { variant: 'separated' },
    carousel: { centerMode: true, autoplayInterval: 2000, autoplayResumeDelay: 10000 },
  },

  icons: {
    accordionChevron: { type: 'svg', flipInRtl: true, markup: '<svg ... stroke="currentColor">...</svg>' },
    carouselPrev:     { type: 'svg', flipInRtl: true, markup: '<svg ... stroke="currentColor">...</svg>' },
    carouselNext:     { type: 'svg', flipInRtl: true, markup: '<svg ... stroke="currentColor">...</svg>' },
    selectChevron:    { type: 'svg', markup: '<svg ... fill="currentColor">...</svg>' },
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
      headerBackgroundHover: '{components.accordion.headerBackground}', // no hover change
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
  },
});
```

| Local edit in the fork                                                   | Replaced by |
| ------------------------------------------------------------------------ | ----------- |
| Accordion: cards, round arrow button, RTL mirroring                       | `defaults.accordion`, `accordion.gap/itemRadius/chevron*`, `icons.accordionChevron` with `flipInRtl` |
| Carousel: centre mode, arrow offset, pill dot, autoplay and drag fixes    | `defaults.carousel`, `carousel.arrowOffset/dotActive*`; drag and autoplay fixes ship in the component |
| Select: SSR fix, `ariaLabel`, icon, panel and option radius               | Shipped fix, `select.iconSize/panelRadius/option*`, `icons.selectChevron` |
| Textarea: radius, `resize: none`                                          | `textarea.radius`, `textarea.resize` |
| Toggle Group: `ariaLabel`, optional label                                 | Shipped |
| Tag: icon size                                                            | `tag.iconSize` |

Points worth checking after the move:

- With a dedicated `carouselPrev` / `carouselNext` you do **not** set the arrow rotation tokens; they apply
  only to the fallback chevron.
- A directional accordion glyph that rotates when open should set `flipInRtl: true`; the rotation then
  reverses under RTL automatically.
- Report Appendix A: none of those local changes need adopting. The carousel dots remain `<button>`
  elements, the placeholder stays real text, and `autoplayInterval` stays a preset default rather than a
  library default.

---

## 7. Documentation

- Component pages: new demos (separated accordion, carousel centre mode and pause/play, icon-only toggle
  segments) and updated API and theming tables for every item above.
- Theming guide: new sections on per-component icons, `currentColor` and `flipInRtl`, and component
  defaults.
- `AGENTS.md` and `libs/tokens/README.md` describe `defaults` and the icon slots, and the themed-build
  checklist now covers custom SVG icons.

---

## 8. Verification

| Check | Result |
| ----- | ------ |
| Computed-style comparison of accordion, carousel, select (open), textarea, tag and toggle-group, before vs after, LTR/RTL × light/dark | No differences other than the new demos and the intended fixes above |
| Live-browser checks of the new behaviour (scroll-listener lifecycle, every new token, separated accordion, centre mode centring / click / drag in LTR and RTL, autoplay pausing, reduced motion, pause/play, Float Label association) | All pass |
| Library unit tests (tokens, theme, primitives, all seven presets, CLI) | 123 pass |
| Production build of the docs application, lint on changed files | Clean |

### Not covered

- **Server rendering itself.** `@angular/platform-server` is not installed in this repository, so SSR
  was not run end to end. The fix was verified in the browser by confirming no `document` listener exists
  until a panel opens, and by removing every construction-time `document` and `window` access.
- **Toggle Group's development warning** was confirmed not to fire on correctly labelled items. Its
  positive case is a one-line `console.warn` that was reviewed but not exercised.

---

## 9. Known limitations and follow-ups

- **Remaining literals.** Motion durations (`0.15s`, `0.2s`) and a few Date Picker sizes are still literals
  outside the components audited. `carousel.slideTransition` covers slide movement only.
- **`autoplayResumeDelay: 0`** disables the interaction pause rather than stopping autoplay permanently.
  For a permanent stop, use the pause/play button.
- **Centre-mode neighbours** activate by pointer only; they are inert, so keyboard users move with the
  arrow keys or dots.
- **Existing test failures unrelated to this release:** `nx test tailwind` (the checked-in Tailwind recipe's
  comment text has drifted from the generator's output) and `nx test docs` (scaffolding specs import an
  API removed in Angular 22).

---

## 10. Files changed

| Area | Location |
| ---- | -------- |
| Token types and icon types | `libs/tokens/src/lib/token-types.ts`, `icon-tokens.ts`, `icon-ref.ts` |
| Defaults provider | `libs/theme/src/lib/component-defaults.token.ts` (new), `provide-semiui.ts` |
| Icon mirroring | `libs/primitives/icon/src/lib/icon.component.ts` |
| Semi preset | `libs/presets/semi/src/lib/semi.ts` |
| Recipes (mirrored to `apps/docs/src/app/components/`) | accordion, carousel, select, multiselect, auto-complete, cascade-select, textarea, tag, toggle-group, float-label, date-picker, color-picker, context-menu, popover, tooltip |
| Tests | `token-engine.spec.ts`, `provide-semiui.spec.ts`, `icon.component.spec.ts`, `semi.spec.ts` |
| Documentation | Component pages, the theming guide, `AGENTS.md`, `libs/tokens/README.md` |
| Release | `.changeset/report-bugs-and-enhancements.md` |

---

*Thank you to the Safeer team for a thorough, well-evidenced report. It made these changes precise.*

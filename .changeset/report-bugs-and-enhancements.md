---
'@semiui/tokens': minor
'@semiui/theme': minor
'@semiui/primitives': minor
'@semiui/presets-semi': minor
'@semiui/cli': minor
---

Fixes and additions from the Safeer landing-page report (SEMIUI_BUGS_AND_ENHANCEMENTS_REPORT.md), so a
design can be expressed entirely from `definePreset(...)` with no forked components. Every new token
and input defaults to today's behavior.

**Fixes**

- SSR: Select, Multiselect, Auto Complete, Cascade Select, Color Picker, Context Menu, Popover, Tooltip
  and Date Picker no longer touch `document`/`window` at construction. Their scroll listener now exists
  only while the panel is open (Tooltip: only while a hover is in flight).
- Toggle Group: an icon-only segment can take `ariaLabel`, and no empty label element is rendered.
- Select: `ariaLabel`, `ariaLabelledby` and `clearLabel` inputs.
- Carousel: autoplay pauses on keyboard focus and after manual navigation (`autoplayResumeDelay`), and
  never runs under `prefers-reduced-motion`. Drag ignores non-primary mouse buttons, no longer fights
  text/image selection, and captures the pointer only once it is a real drag. Off-screen slides are now
  `inert`, not just `aria-hidden`, so nothing inside them stays focusable.
- Carousel and Accordion no longer share one icon for their arrows with Select (see icons below).
- Select and Multiselect now honor `select.panelMaxHeight`, which they previously ignored.

**Additions**

- Accordion: `variant="separated"` (one card per item) and `chevron*` / `gap` / `item*` tokens.
- Carousel: `centerMode` (`centerSlideWidth`, `centerGap`) plus `arrowOffset`, `dotActive*`,
  `centerInactive*`, `arrowIconRotation*` and `slideTransition` tokens.
- Select family: `iconSize`, `iconRotationOpen`, `triggerGap`, `panelRadius`, `listPadding`, `optionRadius`,
  `optionPaddingX/Y`, `opacityLoading`; Select also gets an `inputId` input.
- Textarea: its own `radius`, `paddingX/Y`, `fontSize`, `resize` and `counterInset` tokens (each follows `input.*` where one exists).
- Tag: `gap`, `iconSize`, `removeIconSize`, `removeOpacity`.
- Carousel: optional visible pause/play button (`showAutoplayToggle`, `pauseLabel`, `playLabel`; `carouselPause` / `carouselPlay` icon slots).
- Float Label ties its label to the wrapped control (`for` / `aria-labelledby`).
- Toggle Group warns in dev mode about an item with neither `label` nor `ariaLabel`.
- Presets can set `defaults` for component inputs (`ComponentDefaults`, `injectComponentDefaults`).
- Optional `accordionChevron`, `carouselPrev`, `carouselNext` and `selectChevron` icon slots, each falling
  back to `chevronDown`; `IconRef` gains `flipInRtl`.

---
'@semiui/tokens': patch
'@semiui/theme': patch
'@semiui/primitives': patch
'@semiui/presets-semi': patch
'@semiui/cli': patch
---

Fixes two follow-up bugs found while migrating off forked components onto 1.2.0's stock ones
(`docs/SEMIUI_ICON_AND_CAROUSEL_BUGS.md`):

- **BUG-8 — icon-size tokens didn't resize the rendered icon.** `<s-icon>` renders through
  `ng-icon`, which sizes itself from its own `--ng-icon__size` custom property (or `font-size`) —
  never from a `width`/`height` set on an ancestor, since those aren't inherited. Every
  per-component token that sizes an icon (`select.iconSize`, `tag.iconSize`,
  `tag.removeIconSize`, `table.sortIconSize`, `treeTable.toggleIconSize`,
  `fullCalendar.navIconSize`, `scrollTop.iconSize`, `richTextEditor.toolIconSize`,
  `timeline.markerIconSize`, and the Select family's shared `iconSize`) now also sets
  `--ng-icon__size`, so a custom icon actually renders at the size the token says. Accordion's
  `chevronSize` sizes a box that's legitimately bigger than the glyph inside it (a filled circle),
  so it keeps doing only that; a new `chevronIconSize` token (default `1em`, a no-op) sizes the
  glyph itself.
- **BUG-9 — Carousel's floating arrows (and the autoplay toggle) could center on the wrong box.**
  Previously positioned with `top: 50%` against `.s-carousel`, which also contains the dots row —
  with dots visible, that measurably pushed the arrows below the viewport's true center (worse
  with a larger `dotSize` or more dots). They're now positioned against `.s-carousel__body`, which
  holds only the viewport. This was general, not limited to `centerMode`: the library's own
  default `<s-carousel>` (floating arrows, dots on) had the same offset.

Every affected default was measured in a live browser before and after: Select, Multiselect,
Cascade Select and Accordion's own defaults render pixel-identical to 1.2.0 (their tokens already
defaulted to `1em`); the eight audited icon tokens now correctly size their glyph at the token's
own default, a small, intentional correction described in the release notes. The carousel fix
removes a real ~8px vertical offset from the library's own default demo.

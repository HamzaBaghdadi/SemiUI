interface IconRefOptions {
  /**
   * Mirrors the icon horizontally when it renders inside a right-to-left context. Set it on
   * directional glyphs (an arrow, a diagonal chevron, "back"/"forward") that point somewhere; a
   * symmetric or vertical glyph (a plain down-chevron, a check) should leave it off.
   */
  flipInRtl?: boolean;
}

/**
 * A reference to an icon: either a name registered with ng-icons, or raw inline SVG markup.
 *
 * Inline markup should paint with `currentColor` (`fill="currentColor"` / `stroke="currentColor"`)
 * rather than a literal hex, so the icon follows the component's foreground token and therefore
 * light/dark mode and every preset. A literal color is a value no preset can restyle.
 */
export type IconRef = ({ type: 'ng-icon'; name: string } | { type: 'svg'; markup: string }) & IconRefOptions;

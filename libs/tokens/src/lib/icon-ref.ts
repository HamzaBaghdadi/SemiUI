/** A reference to an icon: either a name registered with ng-icons, or raw inline SVG markup. */
export type IconRef = { type: 'ng-icon'; name: string } | { type: 'svg'; markup: string };

import { ColorScale, ColorShade } from './token-types';

/** Target lightness (0-100) per shade -- `null` at 500 means "keep the base color exactly as
 * given," so `generateColorScale(base)[500] === base` always. Hue and saturation are held
 * constant from the base color at every other step; only lightness varies, which is what a tint
 * (lighter) / shade (darker) ramp actually is. Fixed targets rather than base-lightness-relative
 * offsets, so the ramp reads consistently regardless of how light or dark the base color itself
 * happens to be -- the same approach Tailwind's own default palettes use. */
const LIGHTNESS_TARGETS: Record<ColorShade, number | null> = {
  50: 97,
  100: 93,
  200: 85,
  300: 74,
  400: 62,
  500: null,
  600: 46,
  700: 38,
  800: 31,
  900: 26,
  950: 17,
};

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return { h: h * 60, s: s * 100, l: l * 100 };
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = h / 360;
  const sat = s / 100;
  const light = l / 100;
  let r: number;
  let g: number;
  let b: number;
  if (sat === 0) {
    r = g = b = light;
  } else {
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;
    r = hueToRgb(p, q, hue + 1 / 3);
    g = hueToRgb(p, q, hue);
    b = hueToRgb(p, q, hue - 1 / 3);
  }
  const toHex = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generates an 11-step tint/shade ramp from a single base hex color, anchored so shade `500`
 * always equals `base` exactly -- hue and saturation come from `base` and stay fixed across every
 * shade; only lightness moves along `LIGHTNESS_TARGETS`. A reasonable default when a preset
 * doesn't hand-author a full scale of its own; presets that care about matching a design system's
 * *published* ramp exactly (Carbon's Blue 60 family, say) can still author `palette.primary`
 * literally shade-by-shade instead of calling this.
 */
export function generateColorScale(base: string): ColorScale {
  const { h, s } = hexToHsl(base);
  const scale = {} as ColorScale;
  (Object.keys(LIGHTNESS_TARGETS) as unknown as ColorShade[]).forEach((shade) => {
    const target = LIGHTNESS_TARGETS[shade];
    scale[shade] = target === null ? base : hslToHex(h, s, target);
  });
  return scale;
}

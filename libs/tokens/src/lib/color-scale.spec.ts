import { generateColorScale } from './color-scale';

describe('generateColorScale', () => {
  it('anchors shade 500 to the base color exactly', () => {
    const scale = generateColorScale('#3b82f6');

    expect(scale[500]).toBe('#3b82f6');
  });

  it('produces a lighter tint at 50 and a darker shade at 950', () => {
    const scale = generateColorScale('#3b82f6');

    // Rough sanity check via luminance proxy: lower hex red-channel-adjacent brightness at 950,
    // higher at 50, without asserting exact hex values the HSL math could shift slightly.
    const toBrightness = (hex: string) => parseInt(hex.slice(1), 16);
    expect(toBrightness(scale[50])).toBeGreaterThan(toBrightness(scale[500]));
    expect(toBrightness(scale[950])).toBeLessThan(toBrightness(scale[500]));
  });

  it('produces all 11 shades', () => {
    const scale = generateColorScale('#dc2626');

    expect(Object.keys(scale).sort((a, b) => Number(a) - Number(b))).toEqual([
      '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950',
    ]);
  });
});

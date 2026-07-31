import { ThemePreset } from '@zaytoon/tokens';
import { renderThemeStylesheet } from './theme-stylesheet';

describe('renderThemeStylesheet', () => {
  const preset = {
    tokens: {
      color: { primary: '#111' },
      spacing: { sm: '0.5rem' },
    },
    darkColor: { primary: '#eee' },
  } as unknown as ThemePreset;

  it('puts base tokens (light palette included) under :root', () => {
    const css = renderThemeStylesheet(preset, 'dark');

    expect(css).toContain(':root {');
    expect(css).toMatch(/:root \{[^}]*--zaytoon-color-primary: #111;/s);
    expect(css).toMatch(/:root \{[^}]*--zaytoon-spacing-sm: 0.5rem;/s);
  });

  it('scopes the dark palette under the configured class name, not :root', () => {
    const css = renderThemeStylesheet(preset, 'dark-mode');

    expect(css).toContain('.dark-mode {');
    expect(css).toMatch(/\.dark-mode \{[^}]*--zaytoon-color-primary: #eee;/s);
  });
});

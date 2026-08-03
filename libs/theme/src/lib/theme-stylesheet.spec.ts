import { ThemePreset } from '@semiui/tokens';
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
    expect(css).toMatch(/:root \{[^}]*--semiui-color-primary: #111;/s);
    expect(css).toMatch(/:root \{[^}]*--semiui-spacing-sm: 0.5rem;/s);
  });

  it('scopes the dark palette under the configured class name, not :root', () => {
    const css = renderThemeStylesheet(preset, 'dark-mode');

    expect(css).toContain('.dark-mode {');
    expect(css).toMatch(/\.dark-mode \{[^}]*--semiui-color-primary: #eee;/s);
  });
});

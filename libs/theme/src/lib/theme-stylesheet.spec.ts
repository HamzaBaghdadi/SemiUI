import { ComponentTokens, SemanticTokens, ThemePreset } from '@semiui/tokens';
import { renderThemeStylesheet } from './theme-stylesheet';

function createPreset(dark?: ThemePreset['dark']): ThemePreset {
  return {
    name: 'test',
    primitive: { white: '#fff', ink: { 500: '#111', 300: '#eee' } },
    semantic: {
      primary: '{ink.500}',
      background: '{white}',
      spacing: { sm: '0.5rem' },
    } as unknown as SemanticTokens,
    components: { button: { background: '{primary}' } } as unknown as ComponentTokens,
    dark,
    icons: {} as ThemePreset['icons'],
  };
}

describe('renderThemeStylesheet', () => {
  it('puts every generated variable under :root', () => {
    const css = renderThemeStylesheet(createPreset(), 'dark');

    expect(css).toContain(':root {');
    expect(css).toMatch(/:root \{[^}]*--semiui-primitive-ink-500: #111;/s);
    expect(css).toMatch(/:root \{[^}]*--semiui-color-primary: var\(--semiui-primitive-ink-500\);/s);
    expect(css).toMatch(/:root \{[^}]*--semiui-spacing-sm: 0.5rem;/s);
    expect(css).toMatch(/:root \{[^}]*--semiui-comp-button-background: var\(--semiui-color-primary\);/s);
  });

  it('scopes dark overrides under the configured class name, not :root', () => {
    const css = renderThemeStylesheet(createPreset({ semantic: { primary: '{ink.300}' } }), 'dark-mode');

    expect(css).toContain('.dark-mode {');
    expect(css).toMatch(/\.dark-mode \{[^}]*--semiui-color-primary: var\(--semiui-primitive-ink-300\);/s);
  });

  it('emits only what dark mode changes, so components follow via the cascade', () => {
    const css = renderThemeStylesheet(createPreset({ semantic: { primary: '{ink.300}' } }), 'dark');
    const darkBlock = css.slice(css.indexOf('.dark {'));

    expect(darkBlock).not.toContain('--semiui-comp-button-background');
    expect(darkBlock).not.toContain('--semiui-spacing-sm');
  });

  it('omits the dark rule entirely when a preset declares no overrides', () => {
    const css = renderThemeStylesheet(createPreset(), 'dark');

    expect(css).not.toContain('.dark {');
  });
});

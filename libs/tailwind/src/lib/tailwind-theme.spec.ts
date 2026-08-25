import { IconTokens } from '@semiui/tokens';
import { ComponentTokens, SemanticTokens, ThemePreset, definePreset, resolvePresetToken } from '@semiui/tokens';
import { buildTailwindTheme, buildTailwindThemeMap } from './tailwind-theme';
import { semiuiTailwind } from './plugin';

const icons = {} as IconTokens;

function createPreset(): ThemePreset {
  return {
    name: 'test',
    primitive: {
      white: '#ffffff',
      blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' },
      green: { 500: '#22c55e', 600: '#16a34a' },
      slate: { 100: '#f1f5f9', 200: '#e2e8f0', 500: '#64748b', 900: '#0f172a' },
    },
    semantic: {
      background: '{white}',
      foreground: '{slate.900}',
      primary: '{blue.500}',
      primaryForeground: '{white}',
      success: '{green.600}',
      successForeground: '{white}',
      destructive: '{green.600}',
      destructiveForeground: '{white}',
      danger: '{destructive}',
      muted: '{slate.100}',
      mutedForeground: '{slate.500}',
      border: '{slate.200}',
      ring: '{primary}',
      palette: { primary: '{blue}' },
      spacing: { md: '0.75rem' },
      radius: { md: '0.5rem', full: '9999px' },
      typography: { fontFamily: 'Inter', fontSize: { sm: '0.875rem' }, fontWeight: { medium: '500' } },
    } as unknown as SemanticTokens,
    components: {
      button: { radius: '{radius.md}', variants: { primary: { background: '{primary}' } } },
    } as unknown as ComponentTokens,
    dark: { semantic: { primary: '{blue.400}' } },
    icons,
  };
}

describe('buildTailwindTheme', () => {
  const preset = createPreset();
  const map = buildTailwindThemeMap({ preset });

  it('derives semantic colors as live var() references, never literals', () => {
    expect(map['--color-primary']).toBe('var(--semiui-color-primary)');
    expect(map['--color-primary-foreground']).toBe('var(--semiui-color-primary-foreground)');
    expect(map['--color-background']).toBe('var(--semiui-color-background)');
    expect(map['--color-foreground']).toBe('var(--semiui-color-foreground)');
    expect(map['--color-muted-foreground']).toBe('var(--semiui-color-muted-foreground)');
    expect(map['--color-border']).toBe('var(--semiui-color-border)');
    expect(map['--color-ring']).toBe('var(--semiui-color-ring)');
    expect(map['--color-success']).toBe('var(--semiui-color-success)');

    // No entry anywhere is a raw color -- that is what makes runtime theming work.
    expect(Object.values(map).every((value) => value.startsWith('var(--semiui-'))).toBe(true);
  });

  it('exposes aliases through the same chain as every other semantic token', () => {
    expect(map['--color-danger']).toBe('var(--semiui-color-danger)');
    // ...and `--semiui-color-danger` is itself an alias, resolved by the token engine, not here.
    expect(resolvePresetToken(preset, 'danger')).toBe(resolvePresetToken(preset, 'destructive'));
  });

  it('exposes primitive scales and the semantic ramp', () => {
    expect(map['--color-blue-500']).toBe('var(--semiui-primitive-blue-500)');
    expect(map['--color-blue-600']).toBe('var(--semiui-primitive-blue-600)');
    expect(map['--color-primary-500']).toBe('var(--semiui-color-palette-primary-500)');
  });

  it('maps spacing, radius and typography onto their Tailwind namespaces', () => {
    expect(map['--radius-md']).toBe('var(--semiui-radius-md)');
    expect(map['--radius-full']).toBe('var(--semiui-radius-full)');
    expect(map['--spacing-semiui-md']).toBe('var(--semiui-spacing-md)');
    expect(map['--font-semiui']).toBe('var(--semiui-typography-font-family)');
    expect(map['--text-semiui-sm']).toBe('var(--semiui-typography-font-size-sm)');
    expect(map['--font-weight-semiui-medium']).toBe('var(--semiui-typography-font-weight-medium)');
  });

  it('namespaces only the scales that collide, and only when asked to', () => {
    const bare = buildTailwindThemeMap({ preset, scaleNamespace: null });

    expect(bare['--spacing-md']).toBe('var(--semiui-spacing-md)');
    expect(bare['--text-sm']).toBe('var(--semiui-typography-font-size-sm)');
    expect(bare['--font-weight-medium']).toBe('var(--semiui-typography-font-weight-medium)');
    // Colors and radius are never namespaced -- `bg-primary` / `rounded-md` following the preset
    // is the point of the integration.
    expect(bare['--color-primary']).toBe(map['--color-primary']);
    expect(bare['--radius-md']).toBe(map['--radius-md']);
  });

  it('never exposes a component token', () => {
    const entries = buildTailwindTheme({ preset });

    expect(entries.some((entry) => entry.group === 'component')).toBe(false);
    expect(entries.some((entry) => entry.value.includes('--semiui-comp-'))).toBe(false);
    expect(map['--color-button-variants-primary-background']).toBeUndefined();
  });

  it('honours an explicit include list', () => {
    const semanticOnly = buildTailwindThemeMap({ preset, include: ['color'] });

    expect(semanticOnly['--color-primary']).toBeDefined();
    expect(semanticOnly['--color-blue-500']).toBeUndefined();
    expect(semanticOnly['--radius-md']).toBeUndefined();
  });

  it('cannot be tricked into exposing component tokens through include', () => {
    const entries = buildTailwindTheme({
      preset,
      include: ['component', 'color'] as never,
    });

    expect(entries.some((entry) => entry.group === 'component')).toBe(false);
  });

  it('carries a preset override through to the Tailwind theme with no config change', () => {
    const MyTheme = definePreset(preset, {
      primitive: { violet: { 500: '#8b5cf6' } },
      semantic: { primary: '{violet.500}' },
    });
    const derived = buildTailwindThemeMap({ preset: MyTheme });

    // The Tailwind side is byte-identical: only what the variable resolves to has moved.
    expect(derived['--color-primary']).toBe(map['--color-primary']);
    expect(resolvePresetToken(MyTheme, 'primary')).toBe('#8b5cf6');
    expect(derived['--color-violet-500']).toBe('var(--semiui-primitive-violet-500)');
  });

  it('reports the originating token path for every entry', () => {
    const entries = buildTailwindTheme({ preset });
    const primary = entries.find((entry) => entry.name === '--color-primary');

    expect(primary).toMatchObject({ tokenPath: 'primary', group: 'color' });
  });

  it('skips a compat alias the preset does not define', () => {
    const noPalette = { ...preset, semantic: { ...preset.semantic, palette: {} } };

    expect(buildTailwindThemeMap({ preset: noPalette })['--color-primary-emphasis']).toBeUndefined();
    expect(buildTailwindThemeMap({ preset })['--color-primary-emphasis']).toBe(
      'var(--semiui-color-palette-primary-600)',
    );
  });
});

describe('semiuiTailwind plugin', () => {
  const preset = createPreset();

  it('declares the same theme the CSS emitter does, in Tailwind config shape', () => {
    const { config } = semiuiTailwind({ preset });
    const map = buildTailwindThemeMap({ preset });

    expect(config.theme.extend['colors']['primary']).toBe(map['--color-primary']);
    expect(config.theme.extend['colors']['muted-foreground']).toBe(map['--color-muted-foreground']);
    expect(config.theme.extend['colors']['blue-500']).toBe(map['--color-blue-500']);
    expect(config.theme.extend['borderRadius']['md']).toBe(map['--radius-md']);
    expect(config.theme.extend['spacing']['semiui-md']).toBe(map['--spacing-semiui-md']);
    expect(config.theme.extend['fontSize']['semiui-sm']).toBe(map['--text-semiui-sm']);
    expect(config.theme.extend['fontWeight']['semiui-medium']).toBe(map['--font-weight-semiui-medium']);
    expect(config.theme.extend['fontFamily']['semiui']).toBe(map['--font-semiui']);
  });

  it('covers exactly the theme entries the map does', () => {
    const { config } = semiuiTailwind({ preset });
    const declared = Object.values(config.theme.extend).reduce((n, group) => n + Object.keys(group).length, 0);

    expect(declared).toBe(Object.keys(buildTailwindThemeMap({ preset })).length);
  });

  it('adds the bare utilities a named scale cannot express', () => {
    const added: Record<string, Record<string, string>> = {};
    semiuiTailwind({ preset }).handler({ addUtilities: (u) => Object.assign(added, u) });

    expect(added['.rounded-border']).toEqual({ 'border-radius': 'var(--semiui-radius-md)' });
    expect(added['.border-surface']).toEqual({ 'border-color': 'var(--semiui-color-border)' });
  });
});

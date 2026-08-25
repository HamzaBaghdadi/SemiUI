import { buildThemeVars, flattenPreset, resolvePresetToken, validatePreset } from './token-engine';
import { CircularTokenReferenceError, MissingTokenReferenceError } from './token-ref';
import { definePreset } from './define-preset';
import { IconTokens } from './icon-tokens';
import { ComponentTokens, SemanticTokens, ThemePreset } from './token-types';

const icons = { loading: { type: 'ng-icon', name: 'x' } } as unknown as IconTokens;

/**
 * A miniature but structurally complete preset: primitives feeding semantics feeding components,
 * plus a dark override and an alias. Everything the engine does is exercised against this rather
 * than against a real preset, so a test failure points at the engine, not at a design decision.
 */
function createPreset(overrides: Partial<ThemePreset> = {}): ThemePreset {
  return {
    name: 'test',
    primitive: {
      white: '#ffffff',
      transparent: 'transparent',
      blue: { 500: '#3b82f6', 400: '#60a5fa' },
      green: { 500: '#22c55e', 600: '#16a34a' },
      slate: { 100: '#f1f5f9', 900: '#0f172a' },
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
      ring: '{primary}',
      palette: { primary: '{blue}' },
      spacing: { md: '0.75rem' },
      radius: { md: '0.5rem', full: '9999px' },
      typography: { fontSize: { sm: '0.875rem' }, fontWeight: { medium: '500' } },
    } as unknown as SemanticTokens,
    components: {
      button: {
        radius: '{radius.md}',
        fontWeight: '{typography.fontWeight.medium}',
        paddingX: '{spacing.md}',
        variants: {
          primary: { background: '{primary}', foreground: '{primaryForeground}' },
          success: { background: '{success}' },
          danger: { background: '{danger}' },
        },
      },
      tag: {
        background: 'color-mix(in srgb, {success} 15%, transparent)',
        shadow: '0 8px 24px rgb(15 23 42 / 0.10)',
      },
      speedDial: { background: '{components.button.variants.primary.background}' },
    } as unknown as ComponentTokens,
    dark: {
      semantic: { primary: '{blue.400}', background: '{slate.900}', success: '{green.500}' },
    },
    icons,
    ...overrides,
  };
}

describe('CSS variable naming', () => {
  it('gives each layer its own namespace and kebab-cases camelCase segments', () => {
    const { root } = buildThemeVars(createPreset());

    expect(root['--semiui-primitive-blue-500']).toBe('#3b82f6');
    expect(root['--semiui-color-primary']).toBeDefined();
    expect(root['--semiui-color-primary-foreground']).toBeDefined();
    expect(root['--semiui-color-palette-primary-500']).toBeDefined();
    expect(root['--semiui-spacing-md']).toBe('0.75rem');
    expect(root['--semiui-radius-md']).toBe('0.5rem');
    expect(root['--semiui-typography-font-size-sm']).toBe('0.875rem');
    expect(root['--semiui-typography-font-weight-medium']).toBe('500');
    expect(root['--semiui-comp-button-variants-primary-background']).toBeDefined();
  });
});

describe('primitive -> semantic', () => {
  it('generates a var() reference rather than baking in the literal', () => {
    const { root } = buildThemeVars(createPreset());

    expect(root['--semiui-color-primary']).toBe('var(--semiui-primitive-blue-500)');
  });

  it('expands a whole-scale reference shade by shade', () => {
    const { root } = buildThemeVars(createPreset());

    expect(root['--semiui-color-palette-primary-500']).toBe('var(--semiui-primitive-blue-500)');
    expect(root['--semiui-color-palette-primary-400']).toBe('var(--semiui-primitive-blue-400)');
  });
});

describe('semantic -> component', () => {
  it('points a component token at the semantic variable', () => {
    const { root } = buildThemeVars(createPreset());

    expect(root['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(root['--semiui-comp-button-radius']).toBe('var(--semiui-radius-md)');
  });

  it('resolves references embedded inside a larger CSS expression', () => {
    const { root } = buildThemeVars(createPreset());

    expect(root['--semiui-comp-tag-background']).toBe(
      'color-mix(in srgb, var(--semiui-color-success) 15%, transparent)',
    );
  });

  it('leaves raw CSS values untouched', () => {
    const { root } = buildThemeVars(createPreset());

    expect(root['--semiui-comp-tag-shadow']).toBe('0 8px 24px rgb(15 23 42 / 0.10)');
  });

  it('supports component-to-component references', () => {
    const { root } = buildThemeVars(createPreset());

    expect(root['--semiui-comp-speed-dial-background']).toBe(
      'var(--semiui-comp-button-variants-primary-background)',
    );
  });
});

describe('nested references', () => {
  it('follows component -> semantic -> primitive down to the literal', () => {
    const preset = createPreset();

    expect(resolvePresetToken(preset, 'components.button.variants.primary.background')).toBe('#3b82f6');
    expect(resolvePresetToken(preset, 'ring')).toBe('#3b82f6');
  });
});

describe('aliases', () => {
  it('generates an alias variable instead of duplicating the value', () => {
    const { root } = buildThemeVars(createPreset());

    expect(root['--semiui-color-danger']).toBe('var(--semiui-color-destructive)');
    expect(root['--semiui-comp-button-variants-danger-background']).toBe('var(--semiui-color-danger)');
  });

  it('moves the alias when the aliased token is repointed', () => {
    const preset = definePreset(createPreset(), { semantic: { destructive: '{blue.500}' } });

    expect(resolvePresetToken(preset, 'danger')).toBe('#3b82f6');
    expect(resolvePresetToken(preset, 'components.button.variants.danger.background')).toBe('#3b82f6');
  });
});

describe('dark overrides', () => {
  it('emits only the variables dark mode actually changes', () => {
    const { dark } = buildThemeVars(createPreset());

    expect(dark['--semiui-color-primary']).toBe('var(--semiui-primitive-blue-400)');
    expect(dark['--semiui-color-background']).toBe('var(--semiui-primitive-slate-900)');
    // Unchanged semantics and every mode-agnostic token stay out of the dark rule entirely.
    expect(dark['--semiui-color-primary-foreground']).toBeUndefined();
    expect(dark['--semiui-radius-md']).toBeUndefined();
    expect(dark['--semiui-primitive-blue-500']).toBeUndefined();
  });

  it('propagates to components without any component-level dark override', () => {
    const { dark } = buildThemeVars(createPreset());

    // The component variable keeps pointing at the semantic one, which dark mode redefines --
    // so no `--semiui-comp-button-variants-primary-background` declaration is needed at all.
    expect(dark['--semiui-comp-button-variants-primary-background']).toBeUndefined();
    expect(dark['--semiui-color-success']).toBe('var(--semiui-primitive-green-500)');
  });

  it('is empty when a preset declares no dark overrides', () => {
    const { dark } = buildThemeVars(createPreset({ dark: undefined }));

    expect(dark).toEqual({});
  });
});

describe('validation', () => {
  it('reports a missing reference with the token that used it', () => {
    const preset = createPreset();
    (preset.semantic as unknown as Record<string, string>)['primary'] = '{doesNotExist}';

    expect(() => validatePreset(preset)).toThrow(MissingTokenReferenceError);
    expect(() => validatePreset(preset)).toThrow(/"\{doesNotExist\}" used by "primary"/);
  });

  it('suggests near matches for a mistyped reference', () => {
    const preset = createPreset();
    (preset.semantic as unknown as Record<string, string>)['primary'] = '{blue.5000}';

    expect(() => validatePreset(preset)).toThrow(/Did you mean .*blue\.500/);
  });

  it('reports a circular reference with the cycle', () => {
    const preset = createPreset();
    const semantic = preset.semantic as unknown as Record<string, string>;
    semantic['primary'] = '{ring}';
    semantic['ring'] = '{primary}';

    expect(() => validatePreset(preset)).toThrow(CircularTokenReferenceError);
    expect(() => validatePreset(preset)).toThrow(/primary -> ring -> primary|ring -> primary -> ring/);
  });

  it('reports a self-referencing token', () => {
    const preset = createPreset();
    (preset.semantic as unknown as Record<string, string>)['primary'] = '{primary}';

    expect(() => validatePreset(preset)).toThrow(CircularTokenReferenceError);
  });

  it('runs automatically before CSS generation', () => {
    const preset = createPreset();
    (preset.components as unknown as Record<string, Record<string, string>>)['tag']['background'] = '{nope}';

    expect(() => buildThemeVars(preset)).toThrow(MissingTokenReferenceError);
  });

  it('validates the dark tree too, not just the light one', () => {
    const preset = createPreset({
      dark: { semantic: { primary: '{blue.999}' } as unknown as SemanticTokens },
    });

    expect(() => buildThemeVars(preset)).toThrow(MissingTokenReferenceError);
  });
});

describe('reference resolution scope', () => {
  it('resolves an explicitly prefixed path', () => {
    const { index } = flattenPreset(createPreset());

    expect(index.get('primitive.blue.500')?.cssVar).toBe('--semiui-primitive-blue-500');
    expect(index.get('semantic.primary')?.cssVar).toBe('--semiui-color-primary');
    expect(index.get('components.button.radius')?.cssVar).toBe('--semiui-comp-button-radius');
  });

  it('prefers a semantic token over a same-named primitive', () => {
    const preset = createPreset();
    (preset.primitive as Record<string, string>)['primary'] = '#000000';

    const { index } = flattenPreset(preset);
    expect(index.get('primary')?.layer).toBe('semantic');
    expect(index.get('primitive.primary')?.layer).toBe('primitive');
  });
});

describe('definePreset', () => {
  it('re-colors every dependent component from one semantic override', () => {
    const base = createPreset();
    const derived = definePreset(base, {
      primitive: { violet: { 500: '#8b5cf6' } },
      semantic: { primary: '{violet.500}' },
    });

    const { root } = buildThemeVars(derived);
    expect(root['--semiui-primitive-violet-500']).toBe('#8b5cf6');
    expect(root['--semiui-color-primary']).toBe('var(--semiui-primitive-violet-500)');
    expect(resolvePresetToken(derived, 'components.button.variants.primary.background')).toBe('#8b5cf6');
    expect(resolvePresetToken(derived, 'ring')).toBe('#8b5cf6');
  });

  it('propagates a status override to every component that uses it', () => {
    const derived = definePreset(createPreset(), {
      primitive: { emerald: { 500: '#10b981' } },
      semantic: { success: '{emerald.500}' },
    });

    expect(resolvePresetToken(derived, 'components.button.variants.success.background')).toBe('#10b981');
    expect(buildThemeVars(derived).root['--semiui-comp-tag-background']).toBe(
      'color-mix(in srgb, var(--semiui-color-success) 15%, transparent)',
    );
  });

  it('deep-merges without dropping sibling keys', () => {
    const derived = definePreset(createPreset(), {
      primitive: { blue: { 500: '#000000' } },
      components: { button: { variants: { primary: { background: '{muted}' } } } },
    });

    // Sibling shades, sibling variants and sibling variant fields all survive.
    expect(derived.primitive['blue']).toEqual({ 500: '#000000', 400: '#60a5fa' });
    const variants = (derived.components.button as { variants: Record<string, Record<string, string>> })
      .variants;
    expect(variants['primary']['foreground']).toBe('{primaryForeground}');
    expect(variants['success']['background']).toBe('{success}');
  });

  it('does not mutate the base preset', () => {
    const base = createPreset();
    definePreset(base, { semantic: { primary: '{green.500}' } });

    expect(base.semantic.primary).toBe('{blue.500}');
  });

  it('merges dark overrides rather than replacing them', () => {
    const derived = definePreset(createPreset(), { dark: { semantic: { foreground: '{white}' } } });

    expect(derived.dark?.semantic?.primary).toBe('{blue.400}');
    expect(derived.dark?.semantic?.foreground).toBe('{white}');
  });

  it('composes: a preset derived from a derived preset keeps both layers of overrides', () => {
    const first = definePreset(createPreset(), { name: 'first', semantic: { primary: '{green.500}' } });
    const second = definePreset(first, { name: 'second', semantic: { muted: '{blue.400}' } });

    expect(resolvePresetToken(second, 'primary')).toBe('#22c55e');
    expect(resolvePresetToken(second, 'muted')).toBe('#60a5fa');
    expect(second.name).toBe('second');
  });

  it('names a derived preset after its base when no name is given', () => {
    expect(definePreset(createPreset(), {}).name).toBe('test-derived');
  });

  it('merges icons key by key', () => {
    const derived = definePreset(createPreset(), {
      icons: { loading: { type: 'ng-icon', name: 'spinner' } },
    });

    expect(derived.icons.loading).toEqual({ type: 'ng-icon', name: 'spinner' });
  });
});

describe('multiple themes', () => {
  it('keeps two presets independent, including their dark sets', () => {
    const a = definePreset(createPreset(), { name: 'a', semantic: { primary: '{blue.500}' } });
    const b = definePreset(createPreset(), {
      name: 'b',
      semantic: { primary: '{green.500}' },
      dark: { semantic: { primary: '{green.600}' } },
    });

    const varsA = buildThemeVars(a);
    const varsB = buildThemeVars(b);

    expect(varsA.root['--semiui-color-primary']).toBe('var(--semiui-primitive-blue-500)');
    expect(varsB.root['--semiui-color-primary']).toBe('var(--semiui-primitive-green-500)');
    expect(varsA.dark['--semiui-color-primary']).toBe('var(--semiui-primitive-blue-400)');
    expect(varsB.dark['--semiui-color-primary']).toBe('var(--semiui-primitive-green-600)');
  });
});

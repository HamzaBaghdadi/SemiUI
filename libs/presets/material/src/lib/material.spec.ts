import { buildThemeVars, resolvePresetToken } from '@semiui/tokens';
import { Material } from './material';

describe('Material preset', () => {
  const { root, dark } = buildThemeVars(Material);

  it('wires component tokens through the semantic layer rather than to literals', () => {
    const vars = root;

    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    // Status colors reach components through the semantic layer too -- no component restates them.
    expect(vars['--semiui-comp-button-variants-success-background']).toBe('var(--semiui-color-success)');
    expect(vars['--semiui-comp-toast-variants-success-icon-color']).toBe('var(--semiui-color-success)');
    expect(vars['--semiui-comp-button-radius']).toBe('var(--semiui-radius-full)');
    expect(vars['--semiui-typography-font-family']).toBe('Roboto, "Helvetica Neue", Arial, sans-serif');
  });

  it('resolves its primary all the way down to its own primitive', () => {
    expect(resolvePresetToken(Material, 'primary')).toBe('#6750a4');
    expect(resolvePresetToken(Material, 'components.button.variants.primary.background')).toBe('#6750a4');
    expect(root['--semiui-color-palette-primary-500']).toBe(root['--semiui-color-primary']);
  });

  it('overrides only semantic tokens for dark mode, and lets components follow', () => {
    expect(dark['--semiui-color-background']).toBeDefined();
    expect(dark['--semiui-color-foreground']).toBeDefined();
    // Component variables keep pointing at the semantic ones, so none of them are redeclared.
    expect(Object.keys(dark).some((name) => name.startsWith('--semiui-comp-'))).toBe(false);
  });

  it('defines the default loading icon', () => {
    expect(Material.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

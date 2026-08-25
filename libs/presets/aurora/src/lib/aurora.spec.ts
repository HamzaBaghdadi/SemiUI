import { buildThemeVars, resolvePresetToken } from '@semiui/tokens';
import { Aurora } from './aurora';

describe('Aurora preset', () => {
  const { root, dark } = buildThemeVars(Aurora);

  it('wires component tokens through the semantic layer rather than to literals', () => {
    const vars = root;

    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    // Status colors reach components through the semantic layer too -- no component restates them.
    expect(vars['--semiui-comp-button-variants-success-background']).toBe('var(--semiui-color-success)');
    expect(vars['--semiui-comp-toast-variants-success-icon-color']).toBe('var(--semiui-color-success)');
    // Aurora's tighter corners come from one semantic override, and reach every component that
    // reads the small-radius token.
    expect(vars['--semiui-radius-sm']).toBe('0.25rem');
    expect(vars['--semiui-comp-tag-radius']).toBe('var(--semiui-radius-sm)');
  });

  it('resolves its primary all the way down to its own primitive', () => {
    expect(resolvePresetToken(Aurora, 'primary')).toBe('#6366f1');
    expect(resolvePresetToken(Aurora, 'components.button.variants.primary.background')).toBe('#6366f1');
    expect(root['--semiui-color-palette-primary-500']).toBe(root['--semiui-color-primary']);
  });

  it('overrides only semantic tokens for dark mode, and lets components follow', () => {
    expect(dark['--semiui-color-background']).toBeDefined();
    expect(dark['--semiui-color-foreground']).toBeDefined();
    // Component variables keep pointing at the semantic ones, so none of them are redeclared.
    expect(Object.keys(dark).some((name) => name.startsWith('--semiui-comp-'))).toBe(false);
  });

  it('defines the default loading icon', () => {
    expect(Aurora.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

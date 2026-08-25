import { buildThemeVars, resolvePresetToken } from '@semiui/tokens';
import { Cupertino } from './cupertino';

describe('Cupertino preset', () => {
  const { root, dark } = buildThemeVars(Cupertino);

  it('wires component tokens through the semantic layer rather than to literals', () => {
    const vars = root;

    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    // Status colors reach components through the semantic layer too -- no component restates them.
    expect(vars['--semiui-comp-button-variants-success-background']).toBe('var(--semiui-color-success)');
    expect(vars['--semiui-comp-toast-variants-success-icon-color']).toBe('var(--semiui-color-success)');
    // iOS's capsule button, and its green switch -- which is the semantic success token, not a
    // second copy of the same hex.
    expect(vars['--semiui-comp-button-radius']).toBe('var(--semiui-radius-full)');
    expect(vars['--semiui-comp-switch-background-checked']).toBe('var(--semiui-color-success)');
  });

  it('resolves its primary all the way down to its own primitive', () => {
    expect(resolvePresetToken(Cupertino, 'primary')).toBe('#007aff');
    expect(resolvePresetToken(Cupertino, 'components.button.variants.primary.background')).toBe('#007aff');
    expect(root['--semiui-color-palette-primary-500']).toBe(root['--semiui-color-primary']);
  });

  it('overrides only semantic tokens for dark mode, and lets components follow', () => {
    expect(dark['--semiui-color-background']).toBeDefined();
    expect(dark['--semiui-color-foreground']).toBeDefined();
    // Component variables keep pointing at the semantic ones, so none of them are redeclared.
    expect(Object.keys(dark).some((name) => name.startsWith('--semiui-comp-'))).toBe(false);
  });

  it('defines the default loading icon', () => {
    expect(Cupertino.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

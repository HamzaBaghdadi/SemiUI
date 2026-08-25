import { buildThemeVars, resolvePresetToken } from '@semiui/tokens';
import { Samsung } from './samsung';

describe('Samsung preset', () => {
  const { root, dark } = buildThemeVars(Samsung);

  it('wires component tokens through the semantic layer rather than to literals', () => {
    const vars = root;

    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    // Status colors reach components through the semantic layer too -- no component restates them.
    expect(vars['--semiui-comp-button-variants-success-background']).toBe('var(--semiui-color-success)');
    expect(vars['--semiui-comp-toast-variants-success-icon-color']).toBe('var(--semiui-color-success)');
    // One UI's oversized corners, again a single semantic decision.
    expect(vars['--semiui-comp-button-radius']).toBe('var(--semiui-radius-lg)');
    expect(vars['--semiui-radius-lg']).toBe('1.75rem');
  });

  it('resolves its primary all the way down to its own primitive', () => {
    expect(resolvePresetToken(Samsung, 'primary')).toBe('#0381fe');
    expect(resolvePresetToken(Samsung, 'components.button.variants.primary.background')).toBe('#0381fe');
    expect(root['--semiui-color-palette-primary-500']).toBe(root['--semiui-color-primary']);
  });

  it('overrides only semantic tokens for dark mode, and lets components follow', () => {
    expect(dark['--semiui-color-background']).toBeDefined();
    expect(dark['--semiui-color-foreground']).toBeDefined();
    // Component variables keep pointing at the semantic ones, so none of them are redeclared.
    expect(Object.keys(dark).some((name) => name.startsWith('--semiui-comp-'))).toBe(false);
  });

  it('defines the default loading icon', () => {
    expect(Samsung.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

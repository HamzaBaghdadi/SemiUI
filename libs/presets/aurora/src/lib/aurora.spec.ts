import { flattenTokensToCssVars } from '@semiui/tokens';
import { Aurora } from './aurora';

describe('Aurora preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Aurora.tokens as unknown as Record<string, unknown>);

    expect(vars['--semiui-comp-button-padding-x-md']).toBe('1rem');
    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    expect(vars['--semiui-color-primary']).toBe('#6366f1');
  });

  it('defines a distinct dark-mode color palette', () => {
    expect(Aurora.darkColor.background).not.toBe(Aurora.tokens.color.background);
    expect(Aurora.darkColor.foreground).not.toBe(Aurora.tokens.color.foreground);
  });

  it('defines the default loading icon', () => {
    expect(Aurora.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

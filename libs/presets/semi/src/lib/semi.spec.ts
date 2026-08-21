import { flattenTokensToCssVars } from '@semiui/tokens';
import { Semi } from './semi';

describe('Semi preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Semi.tokens as unknown as Record<string, unknown>);

    expect(vars['--semiui-comp-button-padding-x-md']).toBe('1rem');
    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    expect(vars['--semiui-color-primary']).toBe('#3b82f6');
  });

  it('defines a distinct dark-mode color palette', () => {
    expect(Semi.darkColor.background).not.toBe(Semi.tokens.color.background);
    expect(Semi.darkColor.foreground).not.toBe(Semi.tokens.color.foreground);
  });

  it('defines the default loading icon', () => {
    expect(Semi.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

import { flattenTokensToCssVars } from '@semiui/tokens';
import { Fluent } from './fluent';

describe('Fluent preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Fluent.tokens as unknown as Record<string, unknown>);

    expect(vars['--semiui-comp-button-radius']).toBe('var(--semiui-radius-sm)');
    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    expect(vars['--semiui-color-primary']).toBe('#0078d4');
  });

  it('defines a distinct dark-mode color palette', () => {
    expect(Fluent.darkColor.background).not.toBe(Fluent.tokens.color.background);
    expect(Fluent.darkColor.foreground).not.toBe(Fluent.tokens.color.foreground);
  });

  it('defines the default loading icon', () => {
    expect(Fluent.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

import { flattenTokensToCssVars } from '@semiui/tokens';
import { Samsung } from './samsung';

describe('Samsung preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Samsung.tokens as unknown as Record<string, unknown>);

    expect(vars['--semiui-comp-button-radius']).toBe('var(--semiui-radius-lg)');
    expect(vars['--semiui-comp-switch-background-checked']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-color-primary']).toBe('#0381fe');
  });

  it('defines a distinct dark-mode color palette', () => {
    expect(Samsung.darkColor.background).not.toBe(Samsung.tokens.color.background);
    expect(Samsung.darkColor.foreground).not.toBe(Samsung.tokens.color.foreground);
  });

  it('defines the default loading icon', () => {
    expect(Samsung.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

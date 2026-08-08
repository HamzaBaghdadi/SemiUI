import { flattenTokensToCssVars } from '@semiui/tokens';
import { Cupertino } from './cupertino';

describe('Cupertino preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Cupertino.tokens as unknown as Record<string, unknown>);

    expect(vars['--semiui-comp-button-radius']).toBe('var(--semiui-radius-full)');
    expect(vars['--semiui-comp-switch-background-checked']).toBe('#34c759');
    expect(vars['--semiui-color-primary']).toBe('#007aff');
  });

  it('defines a distinct dark-mode color palette', () => {
    expect(Cupertino.darkColor.background).not.toBe(Cupertino.tokens.color.background);
    expect(Cupertino.darkColor.foreground).not.toBe(Cupertino.tokens.color.foreground);
  });

  it('defines the default loading icon', () => {
    expect(Cupertino.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

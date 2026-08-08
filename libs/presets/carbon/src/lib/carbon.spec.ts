import { flattenTokensToCssVars } from '@semiui/tokens';
import { Carbon } from './carbon';

describe('Carbon preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Carbon.tokens as unknown as Record<string, unknown>);

    expect(vars['--semiui-comp-button-radius']).toBe('0');
    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    expect(vars['--semiui-color-primary']).toBe('#0f62fe');
  });

  it('defines a distinct dark-mode color palette', () => {
    expect(Carbon.darkColor.background).not.toBe(Carbon.tokens.color.background);
    expect(Carbon.darkColor.foreground).not.toBe(Carbon.tokens.color.foreground);
  });

  it('defines the default loading icon', () => {
    expect(Carbon.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

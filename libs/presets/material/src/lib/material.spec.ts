import { flattenTokensToCssVars } from '@semiui/tokens';
import { Material } from './material';

describe('Material preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Material.tokens as unknown as Record<string, unknown>);

    expect(vars['--semiui-comp-button-radius']).toBe('var(--semiui-radius-full)');
    expect(vars['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(vars['--semiui-comp-button-variants-destructive-background']).toBe('var(--semiui-color-destructive)');
    expect(vars['--semiui-color-primary']).toBe('#6750a4');
  });

  it('defines a distinct dark-mode color palette', () => {
    expect(Material.darkColor.background).not.toBe(Material.tokens.color.background);
    expect(Material.darkColor.foreground).not.toBe(Material.tokens.color.foreground);
  });

  it('defines the default loading icon', () => {
    expect(Material.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

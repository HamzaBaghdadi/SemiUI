import { flattenTokensToCssVars } from '@zaytoon/tokens';
import { Aurora } from './aurora';

describe('Aurora preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Aurora.tokens as unknown as Record<string, unknown>);

    expect(vars['--zaytoon-comp-button-padding-x-md']).toBe('1rem');
    expect(vars['--zaytoon-comp-button-variants-primary-background']).toBe('#6366f1');
    expect(vars['--zaytoon-comp-button-variants-destructive-background']).toBe('#ef4444');
    expect(vars['--zaytoon-color-primary']).toBe('#6366f1');
  });

  it('defines the default loading icon', () => {
    expect(Aurora.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

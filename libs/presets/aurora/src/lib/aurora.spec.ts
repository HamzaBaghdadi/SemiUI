import { flattenTokensToCssVars } from '@zaytoon/tokens';
import { Aurora } from './aurora';

describe('Aurora preset', () => {
  it('produces the expected component CSS custom properties', () => {
    const vars = flattenTokensToCssVars(Aurora.tokens as unknown as Record<string, unknown>);

    expect(vars['--zaytoon-comp-button-padding-x']).toBe('1rem');
    expect(vars['--zaytoon-color-primary']).toBe('#6366f1');
  });
});

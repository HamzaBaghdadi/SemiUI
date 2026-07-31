import { flattenTokensToCssVars } from './css-vars';

describe('flattenTokensToCssVars', () => {
  it('flattens nested tokens into kebab-case CSS custom properties', () => {
    const vars = flattenTokensToCssVars({
      color: { primary: '#6366f1' },
      comp: { button: { paddingX: '1rem' } },
    });

    expect(vars).toEqual({
      '--zaytoon-color-primary': '#6366f1',
      '--zaytoon-comp-button-padding-x': '1rem',
    });
  });

  it('ignores non-string leaf values', () => {
    const vars = flattenTokensToCssVars({ color: { primary: undefined } } as never);

    expect(vars).toEqual({});
  });
});

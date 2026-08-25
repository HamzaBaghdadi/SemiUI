import { readFileSync } from 'fs';
import { join } from 'path';
import { Semi } from '@semiui/presets-semi';
import { Carbon } from '@semiui/presets-carbon';
import { definePreset } from '@semiui/tokens';
import { renderTailwindThemeCss } from './render-css';

const RECIPE = join(__dirname, '../../../../recipes/tailwind/tailwind.css');

describe('renderTailwindThemeCss', () => {
  const css = renderTailwindThemeCss({ preset: Semi });

  it('emits an @theme inline block so utilities point straight at the live variable', () => {
    expect(css).toContain('@theme inline {');
    expect(css).toContain('--color-primary: var(--semiui-color-primary);');
    expect(css).toContain('--color-muted-foreground: var(--semiui-color-muted-foreground);');
    expect(css).toContain('--radius-md: var(--semiui-radius-md);');
  });

  it('never emits a literal color', () => {
    const declarations = css.match(/^\s+--[\w-]+:.*$/gm) ?? [];

    expect(declarations.length).toBeGreaterThan(50);
    expect(declarations.every((line) => line.includes('var(--semiui-'))).toBe(true);
    expect(css).not.toMatch(/:\s*#[0-9a-f]{3,8}\s*;/i);
  });

  it('never emits a component token', () => {
    expect(css).not.toContain('--semiui-comp-');
  });

  it('emits the bare utilities a named scale cannot produce', () => {
    expect(css).toContain('@utility rounded-border {');
    expect(css).toContain('border-radius: var(--semiui-radius-md);');
    expect(css).toContain('@utility border-surface {');
  });

  it('follows the preset it is given', () => {
    // Cupertino/Material add scales Semi doesn't; Carbon shares Semi's vocabulary but not its
    // values -- so the *variable names* match while the values behind them differ at runtime.
    const carbon = renderTailwindThemeCss({ preset: Carbon });

    expect(carbon).toContain('--color-blue-500: var(--semiui-primitive-blue-500);');
    expect(carbon).toContain('Generated from the "carbon" preset');
  });

  it('exposes primitive scales a custom preset introduces', () => {
    const MyTheme = definePreset(Semi, {
      name: 'my-theme',
      primitive: { brand: { 500: '#8b5cf6' } },
      semantic: { primary: '{brand.500}' },
    });

    expect(renderTailwindThemeCss({ preset: MyTheme })).toContain(
      '--color-brand-500: var(--semiui-primitive-brand-500);',
    );
  });
});

describe('the checked-in Tailwind recipe', () => {
  it('is exactly what the generator produces for Semi', () => {
    // The recipe is a build artifact. If this fails, run:
    //   npx tsx scripts/generate-tailwind-recipe.mts
    expect(readFileSync(RECIPE, 'utf8').replace(/\r\n/g, '\n')).toBe(
      renderTailwindThemeCss({ preset: Semi }),
    );
  });
});

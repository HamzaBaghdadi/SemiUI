import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { buildThemeVars, definePreset, resolvePresetToken, validatePreset } from '@semiui/tokens';
import { Semi } from './semi';

const RECIPES = join(__dirname, '../../../../../recipes');

/** Every component stylesheet, minus the generated Tailwind bridge (which reads the public scales,
 * not component tokens). */
function stylesheets(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== 'tailwind') stylesheets(path, out);
    } else if (entry.endsWith('.css')) {
      out.push(path);
    }
  }
  return out;
}

describe('Semi preset', () => {
  const { root, dark } = buildThemeVars(Semi);

  it('resolves without missing or circular references', () => {
    expect(() => validatePreset(Semi)).not.toThrow();
  });

  it('routes every component color through the semantic layer', () => {
    expect(root['--semiui-comp-button-variants-primary-background']).toBe('var(--semiui-color-primary)');
    expect(root['--semiui-comp-button-variants-destructive-background']).toBe(
      'var(--semiui-color-destructive)',
    );
    expect(root['--semiui-comp-button-variants-success-background']).toBe('var(--semiui-color-success)');
    // One semantic source per status: the tag wash, the badge fill and the toast icon all point
    // at the same token rather than repeating its hex.
    expect(root['--semiui-comp-tag-variants-success-background']).toBe(
      'color-mix(in srgb, var(--semiui-color-success) 15%, transparent)',
    );
    expect(root['--semiui-comp-badge-variants-success-background']).toBe('var(--semiui-color-success)');
    expect(root['--semiui-comp-toast-variants-success-icon-color']).toBe('var(--semiui-color-success)');
    expect(root['--semiui-comp-avatar-status-online']).toBe('var(--semiui-color-success)');
  });

  it('routes shape and type tokens through the shared scales', () => {
    expect(root['--semiui-comp-button-radius']).toBe('var(--semiui-radius-md)');
    expect(root['--semiui-comp-button-font-weight']).toBe('var(--semiui-typography-font-weight-medium)');
    expect(root['--semiui-comp-input-padding-x']).toBe('var(--semiui-spacing-md)');
    expect(root['--semiui-comp-table-cell-padding-y']).toBe('var(--semiui-spacing-sm)');
  });

  it('keeps genuinely component-local values as raw CSS', () => {
    expect(root['--semiui-comp-dialog-widths-md']).toBe('32rem');
    expect(root['--semiui-comp-select-panel-shadow']).toBe('0 8px 24px rgb(15 23 42 / 0.10)');
    expect(root['--semiui-comp-speed-dial-stagger']).toBe('40ms');
  });

  it('aliases the status vocabulary instead of duplicating colors', () => {
    expect(root['--semiui-color-danger']).toBe('var(--semiui-color-destructive)');
    expect(root['--semiui-color-error']).toBe('var(--semiui-color-destructive)');
    expect(root['--semiui-color-warn']).toBe('var(--semiui-color-warning)');
    expect(resolvePresetToken(Semi, 'danger')).toBe(resolvePresetToken(Semi, 'destructive'));
  });

  it('exposes the full primary ramp, sourced from a primitive scale', () => {
    expect(root['--semiui-color-palette-primary-500']).toBe('var(--semiui-primitive-blue-500)');
    expect(root['--semiui-color-palette-primary-50']).toBeDefined();
    expect(root['--semiui-color-palette-primary-950']).toBeDefined();
    expect(resolvePresetToken(Semi, 'palette.primary.500')).toBe('#3b82f6');
  });

  it('describes dark mode as semantic overrides only', () => {
    expect(dark['--semiui-color-background']).toBe('var(--semiui-primitive-night-base)');
    expect(dark['--semiui-color-primary']).toBe('var(--semiui-primitive-blue-400)');
    // No component token is redeclared for dark mode -- they all follow the semantics above.
    expect(Object.keys(dark).every((name) => name.startsWith('--semiui-color-'))).toBe(true);
  });

  it('inverts contrast tokens for free, because they alias foreground/background', () => {
    expect(root['--semiui-color-contrast']).toBe('var(--semiui-color-foreground)');
    expect(resolvePresetToken(Semi, 'contrast')).toBe('#0f172a');
  });

  it('re-colors the whole library from one semantic override', () => {
    const MyTheme = definePreset(Semi, {
      primitive: { violet: { 500: '#8b5cf6' } },
      semantic: { primary: '{violet.500}' },
    });

    for (const path of [
      'components.button.variants.primary.background',
      'components.badge.variants.primary.background',
      'components.input.borderFocus',
      'components.checkbox.backgroundChecked',
      'components.radio.dotBackground',
      'components.slider.fillColor',
      'components.tabs.indicatorColor',
      'components.pagination.backgroundActive',
      'components.datePicker.dayBackgroundSelected',
      'components.stepper.circleBackgroundActive',
      'ring',
    ]) {
      expect(resolvePresetToken(MyTheme, path)).toBe('#8b5cf6');
    }
  });

  it('propagates a status override to every component that uses it', () => {
    const MyTheme = definePreset(Semi, {
      primitive: { emerald: { 500: '#10b981' } },
      semantic: { success: '{emerald.500}' },
    });

    for (const path of [
      'components.button.variants.success.background',
      'components.badge.variants.success.background',
      'components.tag.variants.success.foreground',
      'components.toast.variants.success.iconColor',
      'components.avatar.statusOnline',
    ]) {
      expect(resolvePresetToken(MyTheme, path)).toBe('#10b981');
    }
  });

  /**
   * The tokens below used to be literals in the component stylesheets. Each one exists so a preset
   * can restyle it, and each defaults to exactly what the literal was -- so the stock Semi look must
   * not move. This pins the resolved values; the rendered comparison lives in the change's
   * before/after browser measurement.
   */
  it('gives every formerly-hardcoded component value its previous default', () => {
    const resolved: Record<string, string> = {
      'components.tag.iconSize': '0.875em',
      'components.select.iconSize': '1em',
      'components.select.iconRotationOpen': '180deg',
      'components.select.panelRadius': resolvePresetToken(Semi, 'components.select.radius'),
      'components.select.optionRadius': resolvePresetToken(Semi, 'radius.sm'),
      'components.select.optionPaddingX': resolvePresetToken(Semi, 'spacing.md'),
      'components.select.optionPaddingY': resolvePresetToken(Semi, 'spacing.sm'),
      'components.textarea.radius': resolvePresetToken(Semi, 'components.input.radius'),
      'components.textarea.paddingX': resolvePresetToken(Semi, 'components.input.paddingX'),
      'components.textarea.paddingY': resolvePresetToken(Semi, 'components.input.paddingY'),
      'components.textarea.fontSize': resolvePresetToken(Semi, 'components.input.fontSize'),
      'components.textarea.resize': 'vertical',
      'components.accordion.chevronSize': '1rem',
      'components.accordion.chevronIconSize': '1em',
      'components.accordion.chevronRotationExpanded': '180deg',
      'components.accordion.chevronBackground': 'transparent',
      'components.accordion.chevronRadius': '0',
      'components.accordion.itemRadius': resolvePresetToken(Semi, 'components.accordion.radius'),
      'components.accordion.itemBorder': resolvePresetToken(Semi, 'components.accordion.border'),
      'components.carousel.arrowOffset': resolvePresetToken(Semi, 'spacing.sm'),
      'components.carousel.arrowIconRotationPrev': '90deg',
      'components.carousel.arrowIconRotationNext': '-90deg',
      'components.carousel.dotActiveWidth': resolvePresetToken(Semi, 'components.carousel.dotSize'),
      'components.carousel.dotActiveScale': '1.2',
      'components.carousel.slideTransition': '0.3s ease',
      'components.select.triggerGap': '0.5rem',
      'components.select.listPadding': '0.25rem',
      'components.select.opacityLoading': '0.6',
      'components.select.panelMaxHeight': '16rem',
      'components.tag.gap': '0.25rem',
      'components.tag.removeIconSize': '0.875em',
      'components.tag.removeOpacity': '0.7',
      'components.textarea.counterInset': '0.5rem',
    };
    for (const [path, expected] of Object.entries(resolved)) {
      expect({ path, value: resolvePresetToken(Semi, path) }).toEqual({ path, value: expected });
    }
    expect(resolvePresetToken(Semi, 'components.select.optionPaddingX')).toBe('0.75rem');
    expect(resolvePresetToken(Semi, 'components.select.optionPaddingY')).toBe('0.5rem');
    expect(resolvePresetToken(Semi, 'components.carousel.arrowOffset')).toBe('0.5rem');
  });

  it('lets the other presets keep following the shared tokens the new ones point at', () => {
    // A preset that squares the input must square its textarea too, without saying so twice.
    const Square = definePreset(Semi, { components: { input: { radius: '0' } } });
    expect(resolvePresetToken(Square, 'components.textarea.radius')).toBe('0');
    // ...and one that gives the textarea its own corner leaves the input alone.
    const Roomy = definePreset(Semi, { components: { textarea: { radius: '1.625rem' } } });
    expect(resolvePresetToken(Roomy, 'components.textarea.radius')).toBe('1.625rem');
    expect(resolvePresetToken(Roomy, 'components.input.radius')).toBe(resolvePresetToken(Semi, 'components.input.radius'));
  });

  it('accepts the per-component icons and input defaults a design can add', () => {
    const arrow = { type: 'svg', markup: '<svg stroke="currentColor"/>', flipInRtl: true } as const;
    const MyTheme = definePreset(Semi, {
      icons: { accordionChevron: arrow, carouselPrev: arrow, carouselNext: arrow, selectChevron: arrow },
      defaults: { accordion: { variant: 'separated' }, carousel: { centerMode: true, autoplayInterval: 2000 } },
      components: {
        accordion: { gap: '0.5rem', itemRadius: '1.5rem', chevronSize: '2.5rem', chevronRotationExpanded: '-90deg' },
        carousel: { arrowOffset: '4.75rem', dotActiveWidth: '1.75rem', dotActiveScale: '1' },
        select: { iconSize: '1.25em', panelRadius: '1.625rem', optionRadius: '1.375rem', optionPaddingX: '0.9rem' },
        textarea: { radius: '1.625rem', resize: 'none' },
        tag: { iconSize: '0.5rem' },
      },
    });

    expect(() => validatePreset(MyTheme)).not.toThrow();
    // The stock chevron survives alongside the dedicated ones, so anything not overridden still falls back to it.
    expect(MyTheme.icons.chevronDown).toEqual(Semi.icons.chevronDown);
    expect(MyTheme.icons.carouselPrev).toEqual(arrow);
    expect(MyTheme.defaults?.carousel).toEqual({ centerMode: true, autoplayInterval: 2000 });
    expect(Semi.defaults).toBeUndefined();
    const { root: vars } = buildThemeVars(MyTheme);
    expect(vars['--semiui-comp-textarea-resize']).toBe('none');
    expect(vars['--semiui-comp-accordion-chevron-rotation-expanded']).toBe('-90deg');
  });

  it('defines the default loading icon', () => {
    expect(Semi.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });

  /**
   * The two ways a token and the stylesheet that should read it drift apart. Both are silent at
   * runtime, which is what makes them worth a test: a token nothing reads looks like working
   * configuration until someone sets it and nothing happens, and a var() no preset defines makes
   * the whole declaration invalid at computed-value time, so the property quietly falls back to
   * its inherited value with no error anywhere.
   */
  describe('component tokens and the stylesheets that read them', () => {
    const files = stylesheets(RECIPES);
    const referenced = new Map<string, string[]>();
    for (const file of files) {
      for (const match of readFileSync(file, 'utf8').matchAll(/var\((--semiui-[a-z0-9-]+)/g)) {
        const users = referenced.get(match[1]) ?? [];
        if (!users.includes(file)) users.push(file);
        referenced.set(match[1], users);
      }
    }

    it('reads every component token from at least one stylesheet', () => {
      const dead = Object.keys(root)
        .filter((name) => name.startsWith('--semiui-comp-'))
        .filter((name) => !referenced.has(name))
        .sort();
      expect(dead).toEqual([]);
    });

    it('never reads a variable no preset defines', () => {
      const undefined_ = [...referenced.keys()].filter((name) => !(name in root)).sort();
      expect(undefined_).toEqual([]);
    });
  });

  /**
   * `<s-icon>` renders through `@ng-icons/core`'s `<ng-icon>`, which sizes itself from its own
   * `--ng-icon__size` custom property (or `1em` of its own font-size) -- never from a `width`/
   * `height` set on an ancestor, since those aren't inherited. A stylesheet that sizes an icon
   * only with `width`/`height` on a wrapper resizes that wrapper's box and nothing else; the
   * glyph inside silently keeps its old size. This guards every per-component icon-size token
   * against that regression: each one must also feed `--ng-icon__size`, which *is* inherited and
   * so reaches the nested `<ng-icon>` regardless of how many elements sit in between.
   */
  describe('icon-size tokens actually resize the rendered glyph', () => {
    const iconSizeTokens = [
      ['accordion/accordion.component.css', '--semiui-comp-accordion-chevron-icon-size'],
      ['select/select.component.css', '--semiui-comp-select-icon-size'],
      ['multiselect/multiselect.component.css', '--semiui-comp-select-icon-size'],
      ['cascade-select/cascade-select.component.css', '--semiui-comp-select-icon-size'],
      ['tag/tag.component.css', '--semiui-comp-tag-icon-size'],
      ['tag/tag.component.css', '--semiui-comp-tag-remove-icon-size'],
      ['table/table.component.css', '--semiui-comp-table-sort-icon-size'],
      ['tree-table/tree-table.component.css', '--semiui-comp-tree-table-toggle-icon-size'],
      ['full-calendar/full-calendar.component.css', '--semiui-comp-full-calendar-nav-icon-size'],
      ['scroll-top/scroll-top.component.css', '--semiui-comp-scroll-top-icon-size'],
      ['rich-text-editor/rich-text-editor.component.css', '--semiui-comp-rich-text-editor-tool-icon-size'],
      ['timeline/timeline.component.css', '--semiui-comp-timeline-marker-icon-size'],
    ] as const;

    it.each(iconSizeTokens)('%s feeds --ng-icon__size from %s', (file, token) => {
      const css = readFileSync(join(RECIPES, file), 'utf8');
      expect(css).toContain(`--ng-icon__size: var(${token})`);
    });
  });

  /**
   * centerMode forces the floating (non-outside) arrow style, whose `top: 50%` previously
   * resolved against `.s-carousel` -- the same containing block as `.s-carousel__dots`, a sibling
   * below the viewport. With dots visible that pushed the arrows below the viewport's true
   * center. `.s-carousel__body` holds nothing but the viewport, so it's the correct containing
   * block; this guards that the floating arrows (and the autoplay toggle, same positioning) live
   * inside it, and that it actually offers one.
   */
  it("carousel's floating arrows and autoplay toggle are positioned against the viewport, not the dots row", () => {
    const css = readFileSync(join(RECIPES, 'carousel/carousel.component.css'), 'utf8');
    const html = readFileSync(join(RECIPES, 'carousel/carousel.component.html'), 'utf8');

    expect(css).toMatch(/\.s-carousel__body\s*{[^}]*position:\s*relative/);

    // Ordering, not exact nesting, is enough to tell the floating arrows and the toggle were
    // moved inside body (before the dots row starts) rather than left as its siblings.
    const bodyOpen = html.indexOf('class="s-carousel__body"');
    const dots = html.indexOf('class="s-carousel__dots"');
    const prevArrow = html.indexOf('s-carousel__arrow s-carousel__arrow--prev"');
    const nextArrow = html.indexOf('s-carousel__arrow s-carousel__arrow--next"');
    const toggle = html.indexOf('s-carousel__autoplay-toggle"');

    expect(bodyOpen).toBeGreaterThanOrEqual(0);
    expect(dots).toBeGreaterThan(bodyOpen);
    for (const marker of [prevArrow, nextArrow, toggle]) {
      expect(marker).toBeGreaterThan(bodyOpen);
      expect(marker).toBeLessThan(dots);
    }
  });
});

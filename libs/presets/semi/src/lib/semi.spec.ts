import { buildThemeVars, definePreset, resolvePresetToken, validatePreset } from '@semiui/tokens';
import { Semi } from './semi';

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

  it('defines the default loading icon', () => {
    expect(Semi.icons.loading).toEqual({ type: 'ng-icon', name: 'lucideLoaderCircle' });
  });
});

import { EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonSize, ButtonVariant, ThemePreset } from '@zaytoon/tokens';
import { ZAYTOON_ICONS } from './icon-tokens.token';
import { provideZaytoonUI } from './provide-zaytoon-ui';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg', 'icon'];

function createTestPreset(): ThemePreset {
  return {
    name: 'test',
    tokens: {
      color: {
        background: '#000',
        foreground: '#fff',
        primary: '#123456',
        primaryForeground: '#fff',
        border: '#333',
        ring: '#333',
        muted: '#111',
        mutedForeground: '#999',
      },
      spacing: { xs: '0.25rem', sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' },
      radius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', full: '9999px' },
      typography: { fontFamily: 'sans-serif', fontSizeSm: '0.875rem', fontSizeMd: '1rem', fontWeightMedium: '500' },
      comp: {
        button: {
          radius: '0.5rem',
          fontWeight: '500',
          focusRing: '#333',
          backgroundDisabled: '#333',
          foregroundDisabled: '#999',
          paddingX: Object.fromEntries(SIZES.map((size) => [size, '1rem'])) as Record<ButtonSize, string>,
          paddingY: Object.fromEntries(SIZES.map((size) => [size, '0.5rem'])) as Record<ButtonSize, string>,
          fontSize: Object.fromEntries(SIZES.map((size) => [size, '0.875rem'])) as Record<ButtonSize, string>,
          variants: Object.fromEntries(
            VARIANTS.map((variant) => [
              variant,
              {
                background: '#123456',
                foreground: '#fff',
                backgroundHover: '#234567',
                backgroundActive: '#012345',
                border: '#123456',
              },
            ]),
          ) as ThemePreset['tokens']['comp']['button']['variants'],
        },
      },
    },
    icons: {
      loading: { type: 'ng-icon', name: 'testLoader' },
    },
  };
}

describe('provideZaytoonUI', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('applies the preset tokens as CSS custom properties on <html> during environment init', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({ providers: [provideZaytoonUI({ preset })] });
    TestBed.inject(EnvironmentInjector);

    expect(document.documentElement.style.getPropertyValue('--zaytoon-color-primary')).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--zaytoon-comp-button-variants-primary-background')).toBe(
      '#123456',
    );
    expect(document.documentElement.style.getPropertyValue('--zaytoon-comp-button-padding-x-md')).toBe('1rem');
  });

  it('registers the preset icons under ZAYTOON_ICONS', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({ providers: [provideZaytoonUI({ preset })] });

    expect(TestBed.inject(ZAYTOON_ICONS)).toEqual(preset.icons);
  });
});

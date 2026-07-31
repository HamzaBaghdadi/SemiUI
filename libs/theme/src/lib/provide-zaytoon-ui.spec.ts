import { EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemePreset } from '@zaytoon/tokens';
import { provideZaytoonUI } from './provide-zaytoon-ui';

describe('provideZaytoonUI', () => {
  const preset: ThemePreset = {
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
          paddingX: '1rem',
          paddingY: '0.5rem',
          radius: '0.5rem',
          fontWeight: '500',
          background: '#123456',
          foreground: '#fff',
          backgroundHover: '#234567',
          backgroundActive: '#012345',
          backgroundDisabled: '#333',
          foregroundDisabled: '#999',
          focusRing: '#333',
        },
      },
    },
  };

  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('applies the preset tokens as CSS custom properties on <html> during environment init', () => {
    TestBed.configureTestingModule({ providers: [provideZaytoonUI({ preset })] });
    TestBed.inject(EnvironmentInjector);

    expect(document.documentElement.style.getPropertyValue('--zaytoon-color-primary')).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--zaytoon-comp-button-padding-x')).toBe('1rem');
  });
});

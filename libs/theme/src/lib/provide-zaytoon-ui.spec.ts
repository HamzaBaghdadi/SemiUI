import { EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonSize, ButtonVariant, ColorTokens, ThemePreset } from '@zaytoon/tokens';
import { ColorModeService } from './color-mode.service';
import { ZAYTOON_COLOR_MODE_CONFIG } from './color-mode.config';
import { ZAYTOON_ICONS } from './icon-tokens.token';
import { provideZaytoonUI } from './provide-zaytoon-ui';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

function createColorTokens(overrides: Partial<ColorTokens>): ColorTokens {
  return {
    background: '#000',
    foreground: '#fff',
    primary: '#123456',
    primaryForeground: '#fff',
    destructive: '#f00',
    destructiveForeground: '#fff',
    border: '#333',
    ring: '#333',
    muted: '#111',
    mutedForeground: '#999',
    ...overrides,
  };
}

function createTestPreset(): ThemePreset {
  return {
    name: 'test',
    tokens: {
      color: createColorTokens({}),
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
            VARIANTS.map((variant) => [variant, { background: '#123456', foreground: '#fff', border: '#123456' }]),
          ) as ThemePreset['tokens']['comp']['button']['variants'],
        },
        input: {
          paddingX: '1rem',
          paddingY: '0.5rem',
          radius: '0.5rem',
          fontSize: '0.875rem',
          background: '#000',
          foreground: '#fff',
          placeholderForeground: '#999',
          border: '#333',
          borderHover: '#444',
          borderFocus: '#333',
          focusRing: '#333',
          borderInvalid: '#f00',
          backgroundDisabled: '#111',
          foregroundDisabled: '#999',
        },
        select: {
          paddingX: '1rem',
          paddingY: '0.5rem',
          radius: '0.5rem',
          fontSize: '0.875rem',
          background: '#000',
          foreground: '#fff',
          placeholderForeground: '#999',
          border: '#333',
          borderHover: '#444',
          borderFocus: '#333',
          focusRing: '#333',
          borderInvalid: '#f00',
          backgroundDisabled: '#111',
          foregroundDisabled: '#999',
          panelBackground: '#000',
          panelBorder: '#333',
          panelShadow: 'none',
          optionForeground: '#fff',
          optionBackgroundHover: '#111',
          optionBackgroundSelected: '#123456',
          optionForegroundSelected: '#fff',
        },
        switch: {
          trackPadding: '0.125rem',
          trackBorderWidth: '1px',
          radius: '9999px',
          background: '#111',
          backgroundChecked: '#123456',
          border: '#333',
          borderChecked: '#123456',
          thumbBackground: '#000',
          focusRing: '#333',
          backgroundDisabled: '#111',
          transitionDuration: '0.15s',
          trackWidth: Object.fromEntries(SIZES.map((size) => [size, '2.75rem'])) as Record<ButtonSize, string>,
          trackHeight: Object.fromEntries(SIZES.map((size) => [size, '1.5rem'])) as Record<ButtonSize, string>,
          thumbSize: Object.fromEntries(SIZES.map((size) => [size, '1.125rem'])) as Record<ButtonSize, string>,
        },
        checkbox: {
          radius: '0.25rem',
          border: '#333',
          borderChecked: '#123456',
          background: '#000',
          backgroundChecked: '#123456',
          foregroundChecked: '#fff',
          focusRing: '#333',
          backgroundDisabled: '#111',
          borderDisabled: '#333',
          size: Object.fromEntries(SIZES.map((size) => [size, '1.25rem'])) as Record<ButtonSize, string>,
        },
        radio: {
          border: '#333',
          borderChecked: '#123456',
          background: '#000',
          backgroundDisabled: '#111',
          borderDisabled: '#333',
          dotBackground: '#123456',
          focusRing: '#333',
          size: Object.fromEntries(SIZES.map((size) => [size, '1.25rem'])) as Record<ButtonSize, string>,
        },
      },
    },
    darkColor: createColorTokens({ background: '#000', foreground: '#fff' }),
    icons: {
      loading: { type: 'ng-icon', name: 'testLoader' },
      chevronDown: { type: 'ng-icon', name: 'testChevronDown' },
      clear: { type: 'ng-icon', name: 'testClear' },
      passwordShow: { type: 'ng-icon', name: 'testShow' },
      passwordHide: { type: 'ng-icon', name: 'testHide' },
      checkboxCheck: { type: 'ng-icon', name: 'testCheck' },
      checkboxIndeterminate: { type: 'ng-icon', name: 'testIndeterminate' },
    },
  };
}

class FakeStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('provideZaytoonUI', () => {
  let fakeStorage: FakeStorage;

  beforeEach(() => {
    fakeStorage = new FakeStorage();
    Object.defineProperty(window, 'localStorage', { value: fakeStorage, configurable: true });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    document.getElementById('zaytoon-theme')?.remove();
    document.documentElement.classList.remove('dark', 'dark-mode');
  });

  it('injects a stylesheet with the preset tokens as CSS custom properties on :root', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({ providers: [provideZaytoonUI({ preset })] });
    TestBed.inject(EnvironmentInjector);

    const styleText = document.getElementById('zaytoon-theme')?.textContent ?? '';
    expect(styleText).toContain('--zaytoon-color-primary: #123456;');
    expect(styleText).toContain('--zaytoon-comp-button-variants-primary-background: #123456;');
    expect(styleText).toContain('--zaytoon-comp-button-padding-x-md: 1rem;');
  });

  it('scopes the dark palette under the configured dark class name', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({
      providers: [provideZaytoonUI({ preset, colorMode: { darkClassName: 'dark-mode' } })],
    });
    TestBed.inject(EnvironmentInjector);

    const styleText = document.getElementById('zaytoon-theme')?.textContent ?? '';
    expect(styleText).toContain('.dark-mode {');
  });

  it('registers the preset icons under ZAYTOON_ICONS', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({ providers: [provideZaytoonUI({ preset })] });

    expect(TestBed.inject(ZAYTOON_ICONS)).toEqual(preset.icons);
  });

  it('applies colorMode overrides to ZAYTOON_COLOR_MODE_CONFIG', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({
      providers: [provideZaytoonUI({ preset, colorMode: { storageKey: 'my-app-theme', darkClassName: 'dark-mode' } })],
    });

    expect(TestBed.inject(ZAYTOON_COLOR_MODE_CONFIG)).toEqual({
      storageKey: 'my-app-theme',
      darkClassName: 'dark-mode',
    });
  });

  it('eagerly constructs ColorModeService so the dark class applies on bootstrap', () => {
    fakeStorage.setItem('zaytoon-color-mode', 'dark');
    const preset = createTestPreset();
    TestBed.configureTestingModule({ providers: [provideZaytoonUI({ preset })] });
    TestBed.inject(EnvironmentInjector);
    TestBed.tick();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(TestBed.inject(ColorModeService).dark()).toBe(true);
  });
});

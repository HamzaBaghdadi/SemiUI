import { EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonSize, ButtonVariant, ColorTokens, DialogSize, ThemePreset, ToastVariant, ToastVariantTokens } from '@zaytoon/tokens';
import { ColorModeService } from './color-mode.service';
import { ZAYTOON_COLOR_MODE_CONFIG } from './color-mode.config';
import { ZAYTOON_ICONS } from './icon-tokens.token';
import { provideZaytoonUI } from './provide-zaytoon-ui';

const VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'danger',
  'success',
  'info',
  'warn',
  'help',
  'contrast',
  'link',
];
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
        popover: {
          background: '#000',
          border: '#333',
          shadow: 'none',
          radius: '0.5rem',
          foreground: '#fff',
          paddingX: '1rem',
          paddingY: '0.75rem',
        },
        tooltip: {
          background: '#fff',
          foreground: '#000',
          radius: '0.375rem',
          paddingX: '0.5rem',
          paddingY: '0.25rem',
          fontSize: '0.875rem',
        },
        skeleton: {
          background: '#111',
          shimmer: 'rgba(255,255,255,0.1)',
          radius: '0.375rem',
        },
        avatar: {
          background: '#111',
          foreground: '#fff',
          radius: '0.5rem',
          statusOnline: '#0f0',
          statusAway: '#ff0',
          statusBusy: '#f00',
          statusOffline: '#999',
          size: { sm: '1.75rem', md: '2.5rem', lg: '3.5rem', xl: '5rem' },
          fontSize: { sm: '0.625rem', md: '0.875rem', lg: '1.125rem', xl: '1.5rem' },
        },
        tag: {
          radius: '0.375rem',
          fontSize: '0.875rem',
          paddingX: '0.5rem',
          paddingY: '0.125rem',
          variants: Object.fromEntries(
            (['default', 'primary', 'secondary', 'destructive', 'danger', 'success', 'info', 'warn', 'help', 'contrast', 'outline'] as const).map((variant) => [
              variant,
              { background: '#111', foreground: '#fff', border: 'transparent' },
            ]),
          ) as ThemePreset['tokens']['comp']['tag']['variants'],
        },
        breadcrumb: {
          foreground: '#999',
          currentForeground: '#fff',
          separatorColor: '#999',
          fontSize: '0.875rem',
          gap: '0.375rem',
        },
        badge: {
          size: '1.25rem',
          dotSize: '0.625rem',
          fontSize: '0.6875rem',
          ringColor: '#000',
          variants: Object.fromEntries(
            (['default', 'primary', 'secondary', 'destructive', 'danger', 'success', 'info', 'warn', 'help', 'contrast', 'outline'] as const).map((variant) => [
              variant,
              { background: '#111', foreground: '#fff', border: 'transparent' },
            ]),
          ) as ThemePreset['tokens']['comp']['badge']['variants'],
        },
        pagination: {
          radius: '0.375rem',
          gap: '0.25rem',
          size: '2.25rem',
          border: '#333',
          background: 'transparent',
          foreground: '#fff',
          backgroundHover: '#111',
          backgroundActive: '#123456',
          foregroundActive: '#fff',
          foregroundDisabled: '#999',
        },
        rating: {
          filledColor: '#f59e0b',
          emptyColor: '#333',
          gap: '0.125rem',
          size: Object.fromEntries(SIZES.map((size) => [size, '1.5rem'])) as Record<ButtonSize, string>,
        },
        accordion: {
          border: '#333',
          radius: '0.375rem',
          headerBackground: 'transparent',
          headerBackgroundHover: '#111',
          headerForeground: '#fff',
          panelBackground: 'transparent',
          panelForeground: '#ccc',
          fontSize: '0.875rem',
          fontWeight: '500',
          paddingX: '1rem',
          paddingY: '0.5rem',
        },
        tabs: {
          border: '#333',
          gap: '1rem',
          foreground: '#ccc',
          foregroundActive: '#fff',
          foregroundDisabled: '#666',
          indicatorColor: '#fff',
          indicatorThickness: '2px',
          fontSize: '0.875rem',
          fontWeight: '500',
          paddingX: '1rem',
          paddingY: '0.5rem',
        },
        stepper: {
          circleSize: '2rem',
          circleBorder: '#333',
          circleBackground: '#000',
          circleForeground: '#ccc',
          circleBackgroundActive: '#fff',
          circleForegroundActive: '#000',
          circleBackgroundCompleted: '#fff',
          circleForegroundCompleted: '#000',
          connectorColor: '#333',
          connectorColorCompleted: '#fff',
          labelColor: '#ccc',
          labelColorActive: '#fff',
          descriptionColor: '#999',
          fontSize: '0.875rem',
          gap: '0.5rem',
        },
        slider: {
          trackSize: '0.375rem',
          trackColor: '#222',
          fillColor: '#fff',
          thumbSize: '1.125rem',
          thumbBackground: '#000',
          thumbBorder: '#fff',
          thumbBorderFocus: '#fff',
          tickColor: '#333',
          tickSize: '0.25rem',
          bubbleBackground: '#fff',
          bubbleForeground: '#000',
        },
        chart: {
          gridColor: '#333',
          axisLabelColor: '#999',
          axisLabelFontSize: '9px',
          tooltipBackground: '#fff',
          tooltipForeground: '#000',
          tooltipRadius: '0.25rem',
          legendFontSize: '0.875rem',
          legendGap: '1rem',
          lineStrokeWidth: '2',
          areaOpacity: '0.15',
        },
        table: {
          border: '#333',
          radius: '0.375rem',
          headerBackground: '#111',
          headerForeground: '#fff',
          rowBackground: '#000',
          rowBackgroundStriped: '#0a0a0a',
          rowBackgroundHover: '#111',
          rowBackgroundSelected: '#222',
          fontSize: '0.875rem',
          cellPaddingX: '1rem',
          cellPaddingY: '0.5rem',
          sortIconColor: '#999',
          sortIconColorActive: '#fff',
        },
        colorPicker: {
          svAreaSize: '12rem',
          hueTrackHeight: '0.75rem',
          thumbSize: '1rem',
          hueThumbWidth: '0.75rem',
          presetSize: '1.5rem',
          presetGap: '0.375rem',
          presetBorder: '#333',
          presetBorderSelected: '#fff',
        },
        datePicker: {
          daySize: '2.25rem',
          fontSize: '0.875rem',
          dayForeground: '#fff',
          dayForegroundOutsideMonth: '#999',
          dayBackgroundHover: '#111',
          dayBackgroundSelected: '#fff',
          dayForegroundSelected: '#000',
          dayBorderToday: '#fff',
          navBackgroundHover: '#111',
          weekdayForeground: '#999',
          monthLabelForeground: '#fff',
        },
        carousel: {
          radius: '0.5rem',
          arrowSize: '2.5rem',
          arrowBackground: 'rgb(0 0 0 / 0.4)',
          arrowBackgroundHover: 'rgb(0 0 0 / 0.6)',
          arrowColor: '#fff',
          dotSize: '0.5rem',
          dotColor: '#333',
          dotColorActive: '#fff',
          dotGap: '0.25rem',
        },
        toast: {
          radius: '0.375rem',
          shadow: 'none',
          paddingX: '1rem',
          paddingY: '0.5rem',
          gap: '0.5rem',
          width: '100%',
          maxWidth: '24rem',
          blur: 'none',
          variants: Object.fromEntries(
            (['default', 'success', 'error', 'warning', 'info'] as const).map((variant) => [
              variant,
              { background: '#000', foreground: '#fff', border: '#333', iconColor: '#fff' },
            ]),
          ) as Record<ToastVariant, ToastVariantTokens>,
        },
        fileUpload: {
          border: '#333',
          borderDragOver: '#fff',
          background: 'transparent',
          backgroundDragOver: '#111',
          radius: '0.5rem',
          iconColor: '#999',
          hintColor: '#fff',
          acceptColor: '#999',
          itemBackground: '#111',
          itemBorder: '#333',
          itemRadius: '0.375rem',
          thumbSize: '2.5rem',
          rejectionColor: '#f00',
        },
        dialog: {
          backdropColor: 'rgb(0 0 0 / 0.5)',
          panelBackground: '#000',
          panelBorder: '#333',
          radius: '0.5rem',
          shadow: 'none',
          headerBorder: '#333',
          footerBorder: '#333',
          titleFontSize: '1.125rem',
          titleFontWeight: '500',
          padding: '1rem',
          widths: Object.fromEntries(
            (['sm', 'md', 'lg', 'full'] as const).map((size) => [size, '32rem']),
          ) as Record<DialogSize, string>,
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
      search: { type: 'ng-icon', name: 'testSearch' },
      plus: { type: 'ng-icon', name: 'testPlus' },
      minus: { type: 'ng-icon', name: 'testMinus' },
      avatarFallback: { type: 'ng-icon', name: 'testUser' },
      rating: { type: 'ng-icon', name: 'testStar' },
      upload: { type: 'ng-icon', name: 'testUpload' },
      file: { type: 'ng-icon', name: 'testFile' },
      toastSuccess: { type: 'ng-icon', name: 'testToastSuccess' },
      toastError: { type: 'ng-icon', name: 'testToastError' },
      toastWarning: { type: 'ng-icon', name: 'testToastWarning' },
      toastInfo: { type: 'ng-icon', name: 'testToastInfo' },
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

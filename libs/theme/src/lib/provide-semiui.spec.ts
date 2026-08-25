import { EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComponentTokens, IconTokens, SemanticTokens, ThemePreset } from '@semiui/tokens';
import { ColorModeService } from './color-mode.service';
import { SEMIUI_COLOR_MODE_CONFIG } from './color-mode.config';
import { SEMIUI_ICONS } from './icon-tokens.token';
import { provideSemiUI } from './provide-semiui';

/**
 * A deliberately tiny preset. Under the token engine a preset is just a token tree, so these tests
 * only need the handful of tokens they actually assert on -- what `provideSemiUI` does with a
 * preset doesn't depend on the preset being complete, and the real presets have their own specs.
 */
function createTestPreset(): ThemePreset {
  return {
    name: 'test',
    primitive: {
      white: '#ffffff',
      blue: { 400: '#60a5fa', 500: '#123456' },
      slate: { 100: '#111111', 900: '#000000' },
    },
    semantic: {
      background: '{slate.900}',
      foreground: '{white}',
      primary: '{blue.500}',
      primaryForeground: '{white}',
      muted: '{slate.100}',
    } as unknown as SemanticTokens,
    components: {
      button: {
        paddingX: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
        variants: { primary: { background: '{primary}', foreground: '{primaryForeground}' } },
      },
    } as unknown as ComponentTokens,
    dark: { semantic: { primary: '{blue.400}' } },
    icons: Object.fromEntries(
      [
        'loading',
        'chevronDown',
        'clear',
        'passwordShow',
        'passwordHide',
        'checkboxCheck',
        'checkboxIndeterminate',
        'search',
        'plus',
        'minus',
        'avatarFallback',
        'rating',
        'upload',
        'file',
        'toastSuccess',
        'toastError',
        'toastWarning',
        'toastInfo',
      ].map((name) => [name, { type: 'ng-icon', name: `test-${name}` }]),
    ) as unknown as IconTokens,
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

describe('provideSemiUI', () => {
  let fakeStorage: FakeStorage;

  beforeEach(() => {
    fakeStorage = new FakeStorage();
    Object.defineProperty(window, 'localStorage', { value: fakeStorage, configurable: true });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    document.getElementById('semiui-theme')?.remove();
    document.documentElement.classList.remove('dark', 'dark-mode');
  });

  it('injects a stylesheet with the preset tokens as CSS custom properties on :root', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({ providers: [provideSemiUI({ preset })] });
    TestBed.inject(EnvironmentInjector);

    const styleText = document.getElementById('semiui-theme')?.textContent ?? '';
    expect(styleText).toContain('--semiui-primitive-blue-500: #123456;');
    expect(styleText).toContain('--semiui-color-primary: var(--semiui-primitive-blue-500);');
    expect(styleText).toContain('--semiui-comp-button-variants-primary-background: var(--semiui-color-primary);');
    expect(styleText).toContain('--semiui-comp-button-padding-x-md: 1rem;');
  });

  it('scopes the dark palette under the configured dark class name', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({
      providers: [provideSemiUI({ preset, colorMode: { darkClassName: 'dark-mode' } })],
    });
    TestBed.inject(EnvironmentInjector);

    const styleText = document.getElementById('semiui-theme')?.textContent ?? '';
    expect(styleText).toContain('.dark-mode {');
  });

  it('registers the preset icons under SEMIUI_ICONS', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({ providers: [provideSemiUI({ preset })] });

    expect(TestBed.inject(SEMIUI_ICONS)).toEqual(preset.icons);
  });

  it('applies colorMode overrides to SEMIUI_COLOR_MODE_CONFIG', () => {
    const preset = createTestPreset();
    TestBed.configureTestingModule({
      providers: [provideSemiUI({ preset, colorMode: { storageKey: 'my-app-theme', darkClassName: 'dark-mode' } })],
    });

    expect(TestBed.inject(SEMIUI_COLOR_MODE_CONFIG)).toEqual({
      storageKey: 'my-app-theme',
      darkClassName: 'dark-mode',
    });
  });

  it('eagerly constructs ColorModeService so the dark class applies on bootstrap', () => {
    fakeStorage.setItem('semiui-color-mode', 'dark');
    const preset = createTestPreset();
    TestBed.configureTestingModule({ providers: [provideSemiUI({ preset })] });
    TestBed.inject(EnvironmentInjector);
    TestBed.tick();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(TestBed.inject(ColorModeService).dark()).toBe(true);
  });
});

import { TestBed } from '@angular/core/testing';
import { ZAYTOON_COLOR_MODE_CONFIG } from './color-mode.config';
import { ColorModeService } from './color-mode.service';

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

describe('ColorModeService', () => {
  let fakeStorage: FakeStorage;

  beforeEach(() => {
    fakeStorage = new FakeStorage();
    Object.defineProperty(window, 'localStorage', { value: fakeStorage, configurable: true });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.classList.remove('dark', 'dark-mode');
    document.documentElement.style.removeProperty('color-scheme');
  });

  function create(config?: Partial<{ storageKey: string; darkClassName: string }>): ColorModeService {
    TestBed.configureTestingModule({
      providers: config
        ? [{ provide: ZAYTOON_COLOR_MODE_CONFIG, useValue: { storageKey: 'zaytoon-color-mode', darkClassName: 'dark', ...config } }]
        : [],
    });
    return TestBed.inject(ColorModeService);
  }

  it('defaults to light when nothing is stored and matchMedia reports light', () => {
    const service = create();
    TestBed.tick();

    expect(service.dark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('reads the persisted preference over the system default', () => {
    fakeStorage.setItem('zaytoon-color-mode', 'dark');
    const service = create();
    TestBed.tick();

    expect(service.dark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggle() flips the mode, updates the class, and persists the new value', () => {
    const service = create();

    service.toggle();
    TestBed.tick();

    expect(service.dark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(fakeStorage.getItem('zaytoon-color-mode')).toBe('dark');
  });

  it('uses the configured dark class name and storage key', () => {
    const service = create({ storageKey: 'my-app-theme', darkClassName: 'dark-mode' });

    service.setDark(true);
    TestBed.tick();

    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(fakeStorage.getItem('my-app-theme')).toBe('dark');
  });

  it('does not throw when localStorage is unavailable', () => {
    Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true });

    expect(() => {
      const service = create();
      service.toggle();
      TestBed.tick();
    }).not.toThrow();
  });
});

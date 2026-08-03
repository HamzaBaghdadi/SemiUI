import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { SEMIUI_COLOR_MODE_CONFIG } from './color-mode.config';

/**
 * Controls light/dark mode: persists the choice to localStorage, falls back to the OS preference
 * when nothing is stored, and toggles the configured dark-mode class on `<html>`. Installed
 * automatically by `provideSemiUI` -- inject it anywhere to read or change the current mode.
 */
@Injectable({ providedIn: 'root' })
export class ColorModeService {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(SEMIUI_COLOR_MODE_CONFIG);

  readonly dark = signal<boolean>(this.initialDark());
  readonly mode = computed(() => (this.dark() ? 'dark' : 'light'));

  constructor() {
    effect(() => {
      const dark = this.dark();
      const root = this.document.documentElement;
      root.classList.toggle(this.config.darkClassName, dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
      this.document.defaultView?.localStorage?.setItem(this.config.storageKey, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.dark.update((dark) => !dark);
  }

  setDark(dark: boolean): void {
    this.dark.set(dark);
  }

  private initialDark(): boolean {
    const view = this.document.defaultView;
    const stored = view?.localStorage?.getItem(this.config.storageKey);
    if (stored !== null && stored !== undefined) {
      return stored === 'dark';
    }
    if (typeof view?.matchMedia !== 'function') {
      return false; // e.g. SSR or test environments without matchMedia
    }
    return view.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}

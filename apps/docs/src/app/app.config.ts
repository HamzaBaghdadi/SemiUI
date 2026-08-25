import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideSemiIcons, Semi } from '@semiui/presets-semi';
import { provideSemiUI } from '@semiui/theme';
import { definePreset } from '@semiui/tokens';
import { appRoutes } from './app.routes';

/** These docs run on stock Semi with one change: Poppins instead of Inter. */
const DocsTheme = definePreset(Semi, {
  name: 'semi-docs',
  semantic: {
    typography: { fontFamily: 'Poppins' },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideSemiUI({ preset: DocsTheme }),
    provideSemiIcons(),
  ],
};

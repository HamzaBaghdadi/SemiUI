import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideZaytoonUI } from '@zaytoon/theme';
import { Aurora } from '@zaytoon/presets-aurora';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideZaytoonUI({ preset: Aurora }),
  ],
};

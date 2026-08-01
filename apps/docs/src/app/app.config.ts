import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideEye, lucideEyeOff, lucideSave } from '@ng-icons/lucide';
import { provideZaytoonUI } from '@zaytoon/theme';
import { Aurora, provideAuroraIcons } from '@zaytoon/presets-aurora';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideZaytoonUI({ preset: Aurora }),
    provideAuroraIcons(),
    provideIcons({ lucideSave, lucideEye, lucideEyeOff, lucideChevronDown }),
  ],
};

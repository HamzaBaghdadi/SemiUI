import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideSave } from '@ng-icons/lucide';
import { provideSemiUI } from '@semiui/theme';
import { Aurora, provideAuroraIcons } from '@semiui/presets-aurora';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideSemiUI({ preset: Aurora }),
    provideAuroraIcons(),
    // Demo-only icons: everything the components themselves need is already covered by
    // provideAuroraIcons() above -- this is for docs pages showing icon overrides.
    provideIcons({ lucideSave }),
  ],
};

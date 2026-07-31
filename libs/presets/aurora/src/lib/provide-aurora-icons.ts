import { Provider } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideLoaderCircle } from '@ng-icons/lucide';

/** Registers the ng-icon names referenced by Aurora's default icon tokens (e.g. the loading spinner). */
export function provideAuroraIcons(): Provider[] {
  return provideIcons({ lucideLoaderCircle });
}

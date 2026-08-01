import { Provider } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideEye, lucideEyeOff, lucideLoaderCircle, lucideX } from '@ng-icons/lucide';

/** Registers the ng-icon names referenced by Aurora's default icon tokens. */
export function provideAuroraIcons(): Provider[] {
  return provideIcons({ lucideLoaderCircle, lucideChevronDown, lucideX, lucideEye, lucideEyeOff });
}

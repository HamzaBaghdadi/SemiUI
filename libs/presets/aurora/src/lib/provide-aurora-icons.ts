import { Provider } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronDown,
  lucideEye,
  lucideEyeOff,
  lucideFile,
  lucideLoaderCircle,
  lucideMinus,
  lucidePlus,
  lucideSearch,
  lucideStar,
  lucideUpload,
  lucideUser,
  lucideX,
} from '@ng-icons/lucide';

/** Registers the ng-icon names referenced by Aurora's default icon tokens. */
export function provideAuroraIcons(): Provider[] {
  return provideIcons({
    lucideLoaderCircle,
    lucideChevronDown,
    lucideX,
    lucideEye,
    lucideEyeOff,
    lucideCheck,
    lucideMinus,
    lucideSearch,
    lucidePlus,
    lucideUser,
    lucideStar,
    lucideUpload,
    lucideFile,
  });
}

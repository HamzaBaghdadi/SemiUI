import { Provider } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronDown,
  lucideCircleCheck,
  lucideCircleX,
  lucideEye,
  lucideEyeOff,
  lucideFile,
  lucideInfo,
  lucideLoaderCircle,
  lucideMinus,
  lucidePlus,
  lucideSearch,
  lucideStar,
  lucideTriangleAlert,
  lucideUpload,
  lucideUser,
  lucideX,
} from '@ng-icons/lucide';

/** Registers the ng-icon names referenced by Semi's default icon tokens. */
export function provideSemiIcons(): Provider[] {
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
    lucideCircleCheck,
    lucideCircleX,
    lucideTriangleAlert,
    lucideInfo,
  });
}

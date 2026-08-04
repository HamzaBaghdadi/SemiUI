import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideChevronDown,
  lucideMoon,
  lucideSearch,
  lucideSun,
} from '@ng-icons/lucide';
import { ColorModeService } from '@semiui/theme';
import { ButtonComponent } from '../../components/button/button.component';
import { TagComponent } from '../../components/tag/tag.component';
import { TooltipDirective } from '../../components/tooltip/tooltip.directive';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  imports: [
    ButtonComponent,
    TooltipDirective,
    TagComponent,
    RouterLink,
    RouterLinkActive,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    provideIcons({
      lucideSearch,
      lucideBell,
      lucideSun,
      lucideMoon,
      lucideChevronDown,
    }),
  ],
})
export class TopbarComponent {
  protected readonly colorModeService = inject(ColorModeService);

  protected readonly menuItems = signal([
    { label: 'Home', link: '/home' },
    { label: 'Components', link: '/components' },
    { label: 'Installation', link: '/installation' },
    { label: 'Presets & Theming', link: '/theming' },
  ]);
}

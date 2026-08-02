import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ColorModeService } from '@zaytoon/theme';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly colorMode = inject(ColorModeService);
  protected title = 'zaytoon';
  protected gettingStarted = [
    { label: 'Installation', path: '/getting-started/installation' },
    { label: 'Quick Start', path: '/getting-started/quick-start' },
    { label: 'CLI Reference', path: '/getting-started/cli' },
  ];
  protected guides = [
    { label: 'Theming', path: '/guides/theming' },
    { label: 'Color Mode', path: '/guides/color-mode' },
  ];
  protected components = [
    { label: 'Error Message', path: '/components/error-message' },
    { label: 'Button', path: '/components/button' },
    { label: 'Text Input', path: '/components/text-input' },
    { label: 'Password', path: '/components/password' },
    { label: 'Select', path: '/components/select' },
    { label: 'Switch', path: '/components/switch' },
    { label: 'Checkbox', path: '/components/checkbox' },
    { label: 'Radio Group', path: '/components/radio-group' },
    { label: 'Textarea', path: '/components/textarea' },
    { label: 'Input Number', path: '/components/input-number' },
    { label: 'OTP', path: '/components/otp' },
    { label: 'Multiselect', path: '/components/multiselect' },
    { label: 'Popover', path: '/components/popover' },
    { label: 'Tooltip', path: '/components/tooltip' },
    { label: 'Divider', path: '/components/divider' },
    { label: 'Skeleton', path: '/components/skeleton' },
    { label: 'Avatar', path: '/components/avatar' },
    { label: 'Tag', path: '/components/tag' },
    { label: 'Breadcrumb', path: '/components/breadcrumb' },
    { label: 'Pagination', path: '/components/pagination' },
    { label: 'Rating', path: '/components/rating' },
    { label: 'Badge', path: '/components/badge' },
    { label: 'Accordion', path: '/components/accordion' },
    { label: 'Tabs', path: '/components/tabs' },
    { label: 'Stepper', path: '/components/stepper' },
    { label: 'Slider', path: '/components/slider' },
    { label: 'Dialog', path: '/components/dialog' },
    { label: 'Drawer', path: '/components/drawer' },
  ];
}

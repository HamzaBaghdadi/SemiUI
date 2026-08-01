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
  ];
}

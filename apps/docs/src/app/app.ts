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
  protected components = [{ label: 'Button', path: '/components/button' }];
}

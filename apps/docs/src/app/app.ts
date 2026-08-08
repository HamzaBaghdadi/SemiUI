import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ColorModeService } from '@semiui/theme';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly colorMode = inject(ColorModeService);
  protected title = 'semiui';
}

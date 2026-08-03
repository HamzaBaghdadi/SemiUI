import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ColorModeService } from '@semiui/theme';

@Component({
  selector: 'app-color-mode-page',
  imports: [RouterLink],
  templateUrl: './color-mode.page.html',
  styleUrl: '../docs-page.css',
})
export class ColorModePage {
  protected readonly colorMode = inject(ColorModeService);
}

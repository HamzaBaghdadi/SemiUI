import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface ThemingRow {
  name: string;
  description: string;
}

/** Renders a component's CSS classes, host data attributes, and preset tokens -- the Theming tab's content on every component page. */
@Component({
  selector: 'app-theming-table',
  imports: [RouterLink],
  templateUrl: './theming-table.component.html',
  styleUrl: './theming-table.component.css',
})
export class ThemingTableComponent {
  /** BEM-style class names the recipe's own stylesheet hangs its rules off (e.g. `.s-button__icon`). */
  cssClasses = input<readonly ThemingRow[]>([]);
  /** Host `[data-*]` attributes driven by inputs, used as CSS selectors for variant/state styling. */
  dataAttributes = input<readonly ThemingRow[]>([]);
  /** `--semiui-comp-*` custom properties the preset's `comp` tokens resolve to for this component. */
  cssVariables = input<readonly ThemingRow[]>([]);
}

import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SIconComponent } from '@semiui/primitives/icon';
import { IconRef } from '@semiui/tokens';
import { injectSemiUIIcons } from '@semiui/theme';

export interface BreadcrumbItem {
  label: string;
  /** Omit for a non-navigable segment (renders as plain text). Any item WITH a link renders as a real anchor -- "current page" status comes from the actual router state via routerLinkActive, not from array position, so the last item isn't special-cased. */
  link?: string | unknown[];
  /** Optional leading icon, rendered before the label. */
  icon?: IconRef;
}

/** A trail of ancestor pages. Items with a `link` are real anchors whose "current page" state is driven by routerLinkActive (exact match) against the actual router URL, not by being the last item in the array. Items without a `link` render as plain, non-navigable text. */
@Component({
  selector: 's-breadcrumb',
  imports: [RouterLink, RouterLinkActive, SIconComponent],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  protected readonly icons = injectSemiUIIcons();

  items = input<readonly BreadcrumbItem[]>([]);
}

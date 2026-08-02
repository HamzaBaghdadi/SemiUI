import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { injectZaytoonIcons } from '@zaytoon/theme';

export interface BreadcrumbItem {
  label: string;
  /** Omit for a non-navigable segment (renders as plain text). Any item WITH a link renders as a real anchor -- "current page" status comes from the actual router state via routerLinkActive, not from array position, so the last item isn't special-cased. */
  link?: string | unknown[];
}

/** A trail of ancestor pages. Items with a `link` are real anchors whose "current page" state is driven by routerLinkActive (exact match) against the actual router URL, not by being the last item in the array. Items without a `link` render as plain, non-navigable text. */
@Component({
  selector: 'z-breadcrumb',
  imports: [RouterLink, RouterLinkActive, ZIconComponent],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  protected readonly icons = injectZaytoonIcons();

  items = input<readonly BreadcrumbItem[]>([]);
}

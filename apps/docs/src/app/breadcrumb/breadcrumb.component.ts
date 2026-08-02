import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { injectZaytoonIcons } from '@zaytoon/theme';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last item (or any item that isn't a link) -- it renders as plain current-page text. */
  link?: string | unknown[];
}

/** A trail of ancestor pages. The last item (or any item without a `link`) renders as the current, non-linked page. */
@Component({
  selector: 'z-breadcrumb',
  imports: [RouterLink, ZIconComponent],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  protected readonly icons = injectZaytoonIcons();

  items = input<readonly BreadcrumbItem[]>([]);
}

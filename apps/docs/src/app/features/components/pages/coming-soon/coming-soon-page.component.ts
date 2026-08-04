import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWrench } from '@ng-icons/lucide';
import { ComponentCatalogEntry } from '../../components-catalog';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

/**
 * Placeholder for every catalog entry not yet ported to the new docs design. The CLI already
 * ships the component's real source today -- only this write-up is pending.
 */
@Component({
  selector: 'app-coming-soon-page',
  imports: [ComponentPageHeaderComponent, NgIcon],
  templateUrl: './coming-soon-page.component.html',
  styleUrl: './coming-soon-page.component.css',
  providers: [provideIcons({ lucideWrench })],
})
export class ComingSoonPageComponent {
  protected readonly entry = inject(ActivatedRoute).snapshot.data['component'] as ComponentCatalogEntry;
}

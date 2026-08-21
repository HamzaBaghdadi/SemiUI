import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { IconFieldComponent } from '../../../components/icon-field/icon-field.component';
import { TextInputComponent } from '../../../components/text-input/text-input.component';
import { COMPONENT_CATALOG, groupByCategory } from '../components-catalog';

/** Searchable, categorized nav for every component in the library. */
@Component({
  selector: 'app-components-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIcon,
    IconFieldComponent,
    TextInputComponent,
  ],
  templateUrl: './components-sidebar.component.html',
  styleUrl: './components-sidebar.component.css',
  providers: [provideIcons({ lucideSearch })],
})
export class ComponentsSidebarComponent {
  protected readonly query = signal('');

  protected readonly groups = computed(() => {
    const query = this.query().trim().toLowerCase();
    const matches = query
      ? COMPONENT_CATALOG.filter((entry) =>
          entry.name.toLowerCase().includes(query),
        )
      : COMPONENT_CATALOG;
    return groupByCategory(matches);
  });

  protected onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}

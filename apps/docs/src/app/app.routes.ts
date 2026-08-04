import { Route } from '@angular/router';
import { COMPONENT_CATALOG } from './features/components/components-catalog';

const readyComponentRoutes: Route[] = [
  {
    path: 'button',
    loadComponent: () =>
      import('./features/components/pages/button/button-page.component').then((m) => m.ButtonPageComponent),
  },
  {
    path: 'tag',
    loadComponent: () =>
      import('./features/components/pages/tag/tag-page.component').then((m) => m.TagPageComponent),
  },
  {
    path: 'checkbox',
    loadComponent: () =>
      import('./features/components/pages/checkbox/checkbox-page.component').then((m) => m.CheckboxPageComponent),
  },
  {
    path: 'text-input',
    loadComponent: () =>
      import('./features/components/pages/text-input/text-input-page.component').then(
        (m) => m.TextInputPageComponent,
      ),
  },
  {
    path: 'accordion',
    loadComponent: () =>
      import('./features/components/pages/accordion/accordion-page.component').then(
        (m) => m.AccordionPageComponent,
      ),
  },
];

const readySlugs = new Set(readyComponentRoutes.map((route) => route.path));

/** Every catalog entry not yet ported gets the same placeholder page, keyed by its catalog data. */
const comingSoonRoutes: Route[] = COMPONENT_CATALOG.filter((entry) => !readySlugs.has(entry.slug)).map((entry) => ({
  path: entry.slug,
  loadComponent: () =>
    import('./features/components/pages/coming-soon/coming-soon-page.component').then(
      (m) => m.ComingSoonPageComponent,
    ),
  data: { component: entry },
}));

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./main/main.component').then((m) => m.MainComponent),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'installation',
        loadComponent: () =>
          import('./features/installation/installation.component').then(
            (m) => m.InstallationComponent,
          ),
      },
      {
        path: 'theming',
        loadComponent: () =>
          import('./features/theming/theming.component').then(
            (m) => m.ThemingComponent,
          ),
      },
      {
        path: 'components',
        loadComponent: () =>
          import('./features/components/components.component').then(
            (m) => m.ComponentsComponent,
          ),
        children: [
          { path: '', redirectTo: 'button', pathMatch: 'full' },
          ...readyComponentRoutes,
          ...comingSoonRoutes,
        ],
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];

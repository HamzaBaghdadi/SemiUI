import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'components/button',
    loadComponent: () => import('./pages/button/button-docs.page').then((m) => m.ButtonDocsPage),
  },
];

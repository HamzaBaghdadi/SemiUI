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
  {
    path: 'components/text-input',
    loadComponent: () => import('./pages/text-input/text-input-docs.page').then((m) => m.TextInputDocsPage),
  },
  {
    path: 'components/password',
    loadComponent: () => import('./pages/password/password-docs.page').then((m) => m.PasswordDocsPage),
  },
];

import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'getting-started/installation',
    loadComponent: () => import('./pages/installation/installation.page').then((m) => m.InstallationPage),
  },
  {
    path: 'getting-started/quick-start',
    loadComponent: () => import('./pages/quick-start/quick-start.page').then((m) => m.QuickStartPage),
  },
  {
    path: 'getting-started/cli',
    loadComponent: () => import('./pages/cli-reference/cli-reference.page').then((m) => m.CliReferencePage),
  },
  {
    path: 'guides/theming',
    loadComponent: () => import('./pages/theming/theming.page').then((m) => m.ThemingPage),
  },
  {
    path: 'guides/color-mode',
    loadComponent: () => import('./pages/color-mode/color-mode.page').then((m) => m.ColorModePage),
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

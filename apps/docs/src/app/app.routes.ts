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
    path: 'components/error-message',
    loadComponent: () =>
      import('./pages/error-message/error-message-docs.page').then((m) => m.ErrorMessageDocsPage),
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
  {
    path: 'components/select',
    loadComponent: () => import('./pages/select/select-docs.page').then((m) => m.SelectDocsPage),
  },
  {
    path: 'components/switch',
    loadComponent: () => import('./pages/switch/switch-docs.page').then((m) => m.SwitchDocsPage),
  },
  {
    path: 'components/checkbox',
    loadComponent: () => import('./pages/checkbox/checkbox-docs.page').then((m) => m.CheckboxDocsPage),
  },
  {
    path: 'components/radio-group',
    loadComponent: () => import('./pages/radio-group/radio-group-docs.page').then((m) => m.RadioGroupDocsPage),
  },
  {
    path: 'components/textarea',
    loadComponent: () => import('./pages/textarea/textarea-docs.page').then((m) => m.TextareaDocsPage),
  },
  {
    path: 'components/input-number',
    loadComponent: () => import('./pages/input-number/input-number-docs.page').then((m) => m.InputNumberDocsPage),
  },
  {
    path: 'components/otp',
    loadComponent: () => import('./pages/otp/otp-docs.page').then((m) => m.OtpDocsPage),
  },
  {
    path: 'components/multiselect',
    loadComponent: () => import('./pages/multiselect/multiselect-docs.page').then((m) => m.MultiselectDocsPage),
  },
  {
    path: 'components/popover',
    loadComponent: () => import('./pages/popover/popover-docs.page').then((m) => m.PopoverDocsPage),
  },
  {
    path: 'components/tooltip',
    loadComponent: () => import('./pages/tooltip/tooltip-docs.page').then((m) => m.TooltipDocsPage),
  },
  {
    path: 'components/divider',
    loadComponent: () => import('./pages/divider/divider-docs.page').then((m) => m.DividerDocsPage),
  },
  {
    path: 'components/skeleton',
    loadComponent: () => import('./pages/skeleton/skeleton-docs.page').then((m) => m.SkeletonDocsPage),
  },
  {
    path: 'components/avatar',
    loadComponent: () => import('./pages/avatar/avatar-docs.page').then((m) => m.AvatarDocsPage),
  },
  {
    path: 'components/tag',
    loadComponent: () => import('./pages/tag/tag-docs.page').then((m) => m.TagDocsPage),
  },
  {
    path: 'components/breadcrumb',
    loadComponent: () => import('./pages/breadcrumb/breadcrumb-docs.page').then((m) => m.BreadcrumbDocsPage),
  },
  {
    path: 'components/pagination',
    loadComponent: () => import('./pages/pagination/pagination-docs.page').then((m) => m.PaginationDocsPage),
  },
  {
    path: 'components/rating',
    loadComponent: () => import('./pages/rating/rating-docs.page').then((m) => m.RatingDocsPage),
  },
  {
    path: 'components/badge',
    loadComponent: () => import('./pages/badge/badge-docs.page').then((m) => m.BadgeDocsPage),
  },
  {
    path: 'components/accordion',
    loadComponent: () => import('./pages/accordion/accordion-docs.page').then((m) => m.AccordionDocsPage),
  },
  {
    path: 'components/tabs',
    loadComponent: () => import('./pages/tabs/tabs-docs.page').then((m) => m.TabsDocsPage),
  },
  {
    path: 'components/stepper',
    loadComponent: () => import('./pages/stepper/stepper-docs.page').then((m) => m.StepperDocsPage),
  },
  {
    path: 'components/slider',
    loadComponent: () => import('./pages/slider/slider-docs.page').then((m) => m.SliderDocsPage),
  },
  {
    path: 'components/dialog',
    loadComponent: () => import('./pages/dialog/dialog-docs.page').then((m) => m.DialogDocsPage),
  },
  {
    path: 'components/drawer',
    loadComponent: () => import('./pages/drawer/drawer-docs.page').then((m) => m.DrawerDocsPage),
  },
  {
    path: 'components/file-upload',
    loadComponent: () => import('./pages/file-upload/file-upload-docs.page').then((m) => m.FileUploadDocsPage),
  },
  {
    path: 'components/toast',
    loadComponent: () => import('./pages/toast/toast-docs.page').then((m) => m.ToastDocsPage),
  },
];

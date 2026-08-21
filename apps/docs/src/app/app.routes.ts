import { Route } from '@angular/router';

const componentRoutes: Route[] = [
  {
    path: 'button',
    loadComponent: () =>
      import('./features/components/pages/button/button-page.component').then((m) => m.ButtonPageComponent),
  },
  {
    path: 'toggle-button',
    loadComponent: () =>
      import('./features/components/pages/toggle-button/toggle-button-page.component').then(
        (m) => m.ToggleButtonPageComponent,
      ),
  },
  {
    path: 'split-button',
    loadComponent: () =>
      import('./features/components/pages/split-button/split-button-page.component').then(
        (m) => m.SplitButtonPageComponent,
      ),
  },
  {
    path: 'toggle-group',
    loadComponent: () =>
      import('./features/components/pages/toggle-group/toggle-group-page.component').then(
        (m) => m.ToggleGroupPageComponent,
      ),
  },
  {
    path: 'speed-dial',
    loadComponent: () =>
      import('./features/components/pages/speed-dial/speed-dial-page.component').then(
        (m) => m.SpeedDialPageComponent,
      ),
  },
  {
    path: 'tag',
    loadComponent: () =>
      import('./features/components/pages/tag/tag-page.component').then((m) => m.TagPageComponent),
  },
  {
    path: 'badge',
    loadComponent: () =>
      import('./features/components/pages/badge/badge-page.component').then((m) => m.BadgePageComponent),
  },
  {
    path: 'avatar',
    loadComponent: () =>
      import('./features/components/pages/avatar/avatar-page.component').then((m) => m.AvatarPageComponent),
  },
  {
    path: 'breadcrumb',
    loadComponent: () =>
      import('./features/components/pages/breadcrumb/breadcrumb-page.component').then(
        (m) => m.BreadcrumbPageComponent,
      ),
  },
  {
    path: 'divider',
    loadComponent: () =>
      import('./features/components/pages/divider/divider-page.component').then((m) => m.DividerPageComponent),
  },
  {
    path: 'skeleton',
    loadComponent: () =>
      import('./features/components/pages/skeleton/skeleton-page.component').then((m) => m.SkeletonPageComponent),
  },
  {
    path: 'rating',
    loadComponent: () =>
      import('./features/components/pages/rating/rating-page.component').then((m) => m.RatingPageComponent),
  },
  {
    path: 'pagination',
    loadComponent: () =>
      import('./features/components/pages/pagination/pagination-page.component').then(
        (m) => m.PaginationPageComponent,
      ),
  },
  {
    path: 'table',
    loadComponent: () =>
      import('./features/components/pages/table/table-page.component').then((m) => m.TablePageComponent),
  },
  {
    path: 'timeline',
    loadComponent: () =>
      import('./features/components/pages/timeline/timeline-page.component').then((m) => m.TimelinePageComponent),
  },
  {
    path: 'tree-table',
    loadComponent: () =>
      import('./features/components/pages/tree-table/tree-table-page.component').then(
        (m) => m.TreeTablePageComponent,
      ),
  },
  {
    path: 'splitter',
    loadComponent: () =>
      import('./features/components/pages/splitter/splitter-page.component').then((m) => m.SplitterPageComponent),
  },
  {
    path: 'rich-text-editor',
    loadComponent: () =>
      import('./features/components/pages/rich-text-editor/rich-text-editor-page.component').then(
        (m) => m.RichTextEditorPageComponent,
      ),
  },
  {
    path: 'image-cropper',
    loadComponent: () =>
      import('./features/components/pages/image-cropper/image-cropper-page.component').then(
        (m) => m.ImageCropperPageComponent,
      ),
  },
  {
    path: 'context-menu',
    loadComponent: () =>
      import('./features/components/pages/context-menu/context-menu-page.component').then(
        (m) => m.ContextMenuPageComponent,
      ),
  },
  {
    path: 'marquee',
    loadComponent: () =>
      import('./features/components/pages/marquee/marquee-page.component').then((m) => m.MarqueePageComponent),
  },
  {
    path: 'full-calendar',
    loadComponent: () =>
      import('./features/components/pages/full-calendar/full-calendar-page.component').then(
        (m) => m.FullCalendarPageComponent,
      ),
  },
  {
    path: 'organization-chart',
    loadComponent: () =>
      import('./features/components/pages/organization-chart/organization-chart-page.component').then(
        (m) => m.OrganizationChartPageComponent,
      ),
  },
  {
    path: 'knob',
    loadComponent: () =>
      import('./features/components/pages/knob/knob-page.component').then((m) => m.KnobPageComponent),
  },
  {
    path: 'chart',
    loadComponent: () =>
      import('./features/components/pages/chart/chart-page.component').then((m) => m.ChartPageComponent),
  },
  {
    path: 'carousel',
    loadComponent: () =>
      import('./features/components/pages/carousel/carousel-page.component').then((m) => m.CarouselPageComponent),
  },
  {
    path: 'text-input',
    loadComponent: () =>
      import('./features/components/pages/text-input/text-input-page.component').then(
        (m) => m.TextInputPageComponent,
      ),
  },
  {
    path: 'auto-complete',
    loadComponent: () =>
      import('./features/components/pages/auto-complete/auto-complete-page.component').then(
        (m) => m.AutoCompletePageComponent,
      ),
  },
  {
    path: 'icon-field',
    loadComponent: () =>
      import('./features/components/pages/icon-field/icon-field-page.component').then(
        (m) => m.IconFieldPageComponent,
      ),
  },
  {
    path: 'float-label',
    loadComponent: () =>
      import('./features/components/pages/float-label/float-label-page.component').then(
        (m) => m.FloatLabelPageComponent,
      ),
  },
  {
    path: 'password',
    loadComponent: () =>
      import('./features/components/pages/password/password-page.component').then((m) => m.PasswordPageComponent),
  },
  {
    path: 'textarea',
    loadComponent: () =>
      import('./features/components/pages/textarea/textarea-page.component').then((m) => m.TextareaPageComponent),
  },
  {
    path: 'input-number',
    loadComponent: () =>
      import('./features/components/pages/input-number/input-number-page.component').then(
        (m) => m.InputNumberPageComponent,
      ),
  },
  {
    path: 'otp',
    loadComponent: () =>
      import('./features/components/pages/otp/otp-page.component').then((m) => m.OtpPageComponent),
  },
  {
    path: 'checkbox',
    loadComponent: () =>
      import('./features/components/pages/checkbox/checkbox-page.component').then((m) => m.CheckboxPageComponent),
  },
  {
    path: 'radio-group',
    loadComponent: () =>
      import('./features/components/pages/radio-group/radio-group-page.component').then(
        (m) => m.RadioGroupPageComponent,
      ),
  },
  {
    path: 'switch',
    loadComponent: () =>
      import('./features/components/pages/switch/switch-page.component').then((m) => m.SwitchPageComponent),
  },
  {
    path: 'select',
    loadComponent: () =>
      import('./features/components/pages/select/select-page.component').then((m) => m.SelectPageComponent),
  },
  {
    path: 'cascade-select',
    loadComponent: () =>
      import('./features/components/pages/cascade-select/cascade-select-page.component').then(
        (m) => m.CascadeSelectPageComponent,
      ),
  },
  {
    path: 'multiselect',
    loadComponent: () =>
      import('./features/components/pages/multiselect/multiselect-page.component').then(
        (m) => m.MultiselectPageComponent,
      ),
  },
  {
    path: 'date-picker',
    loadComponent: () =>
      import('./features/components/pages/date-picker/date-picker-page.component').then(
        (m) => m.DatePickerPageComponent,
      ),
  },
  {
    path: 'color-picker',
    loadComponent: () =>
      import('./features/components/pages/color-picker/color-picker-page.component').then(
        (m) => m.ColorPickerPageComponent,
      ),
  },
  {
    path: 'slider',
    loadComponent: () =>
      import('./features/components/pages/slider/slider-page.component').then((m) => m.SliderPageComponent),
  },
  {
    path: 'popover',
    loadComponent: () =>
      import('./features/components/pages/popover/popover-page.component').then((m) => m.PopoverPageComponent),
  },
  {
    path: 'tooltip',
    loadComponent: () =>
      import('./features/components/pages/tooltip/tooltip-page.component').then((m) => m.TooltipPageComponent),
  },
  {
    path: 'dialog',
    loadComponent: () =>
      import('./features/components/pages/dialog/dialog-page.component').then((m) => m.DialogPageComponent),
  },
  {
    path: 'drawer',
    loadComponent: () =>
      import('./features/components/pages/drawer/drawer-page.component').then((m) => m.DrawerPageComponent),
  },
  {
    path: 'toast',
    loadComponent: () =>
      import('./features/components/pages/toast/toast-page.component').then((m) => m.ToastPageComponent),
  },
  {
    path: 'accordion',
    loadComponent: () =>
      import('./features/components/pages/accordion/accordion-page.component').then(
        (m) => m.AccordionPageComponent,
      ),
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./features/components/pages/tabs/tabs-page.component').then((m) => m.TabsPageComponent),
  },
  {
    path: 'stepper',
    loadComponent: () =>
      import('./features/components/pages/stepper/stepper-page.component').then((m) => m.StepperPageComponent),
  },
  {
    path: 'error-message',
    loadComponent: () =>
      import('./features/components/pages/error-message/error-message-page.component').then(
        (m) => m.ErrorMessagePageComponent,
      ),
  },
  {
    path: 'file-upload',
    loadComponent: () =>
      import('./features/components/pages/file-upload/file-upload-page.component').then(
        (m) => m.FileUploadPageComponent,
      ),
  },
  {
    path: 'scroll-top',
    loadComponent: () =>
      import('./features/components/pages/scroll-top/scroll-top-page.component').then((m) => m.ScrollTopPageComponent),
  },
  {
    path: 'progress-bar',
    loadComponent: () =>
      import('./features/components/pages/progress-bar/progress-bar-page.component').then(
        (m) => m.ProgressBarPageComponent,
      ),
  },
];

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
          ...componentRoutes,
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

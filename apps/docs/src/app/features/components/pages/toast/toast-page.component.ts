import { Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CheckboxComponent } from '../../../../components/checkbox/checkbox.component';
import { ToastContainerComponent, ToastPosition } from '../../../../components/toast/toast-container.component';
import { ToastService, ToastTemplateContext } from '../../../../components/toast/toast.service';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-toast-page',
  imports: [
    ToastContainerComponent,
    ButtonComponent,
    CheckboxComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './toast-page.component.html',
  styleUrl: './toast-page.component.css',
})
export class ToastPageComponent {
  private readonly toastService = inject(ToastService);
  private readonly customToastTemplate = viewChild<TemplateRef<ToastTemplateContext>>('customToast');

  protected position = signal<ToastPosition>('top-right');
  protected stacked = signal(false);

  showDefault(): void {
    this.toastService.show({ title: 'Notification', description: 'This is a default toast.' });
  }

  showSuccess(): void {
    this.toastService.success('Your changes have been saved.', 'Success');
  }

  showError(): void {
    this.toastService.error('Something went wrong. Please try again.', 'Error');
  }

  showWarning(): void {
    this.toastService.warning('Your session expires in 5 minutes.', 'Warning');
  }

  showInfo(): void {
    this.toastService.info('A new version is available.', 'Info');
  }

  showSticky(): void {
    this.toastService.show({ title: 'Sticky', description: 'This one stays until dismissed.', duration: 0 });
  }

  clearAll(): void {
    this.toastService.clear();
  }

  setPosition(position: ToastPosition): void {
    this.position.set(position);
  }

  showStack(): void {
    this.toastService.show({ description: 'First notification', variant: 'info', duration: 0 });
    this.toastService.show({ description: 'Second notification', variant: 'success', duration: 0 });
    this.toastService.show({ description: 'Third notification', variant: 'warning', duration: 0 });
  }

  showNoIcon(): void {
    this.toastService.show({ title: 'No icon', description: 'showIcon: false hides the variant icon.', showIcon: false });
  }

  showCustomTemplate(): void {
    const tpl = this.customToastTemplate();
    if (tpl) {
      this.toastService.show({ template: tpl, duration: 6000 });
    }
  }

  protected secondsLeft(remainingMs: number | null): number {
    return remainingMs === null ? 0 : Math.ceil(remainingMs / 1000);
  }

  protected readonly setupCode = `// app.ts
@Component({
  imports: [ToastContainerComponent, RouterOutlet],
  template: \`<router-outlet /><s-toast-container />\`,
})
export class App {}`;

  protected readonly variantsCode = `protected toastService = inject(ToastService);

toastService.show({ title: 'Notification', description: '...' });
toastService.success('Your changes have been saved.', 'Success');
toastService.error('Something went wrong.', 'Error');
toastService.warning('Session expires in 5 minutes.', 'Warning');
toastService.info('A new version is available.', 'Info');`;

  protected readonly stickyCode = `toastService.show({ title: 'Sticky', description: '...', duration: 0 });  // 0 = no auto-dismiss
toastService.clear();`;

  protected readonly templateCode = `toastService.show({ title: 'No icon', showIcon: false });

<ng-template #customToast let-toast let-dismiss="dismiss" let-remainingMs="remainingMs">
  <div>
    🎉 Fully custom content -- closes in {{ secondsLeft(remainingMs) }}s
    <button (click)="dismiss()">Close</button>
  </div>
</ng-template>
// toastService.show({ template: customToastTemplate, duration: 6000 });`;

  protected readonly stackedCode = `<s-toast-container [stacked]="true" />`;

  protected readonly positionCode = `<s-toast-container position="bottom-right" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'position',
      type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'top-center' | 'bottom-center'",
      default: "'top-right'",
      description: "s-toast-container input. -right/-left pin to that literal screen corner regardless of direction; -start/-end mirror under dir='rtl'; -center centers horizontally.",
    },
    {
      name: 'stacked',
      type: 'boolean',
      default: 'false',
      description: 's-toast-container input. Collapses queued toasts into a peeking deck instead of a growing list; hovering the group expands them.',
    },
    {
      name: '#customToast context',
      type: '{ $implicit: ToastEntry; dismiss: () => void; remainingMs: number | null }',
      description: "Passed to a template set via show({ template }). remainingMs is the countdown in ms toward auto-dismiss, live-updated and frozen while the toast is hovered/paused; null for sticky toasts (duration: 0), which never count down.",
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: "show(options)",
      type: '(options: ToastOptions) => number',
      description: 'ToastService method. Queues a toast and returns its id. duration defaults to 5000ms (0 = sticky); showIcon defaults to true; template fully replaces the icon/title/description/close chrome.',
    },
    {
      name: 'success(description, title?)',
      type: '(description: string, title?: string) => number',
      description: "ToastService method. Shorthand for show({ description, title, variant: 'success' }).",
    },
    {
      name: 'error(description, title?)',
      type: '(description: string, title?: string) => number',
      description: "ToastService method. Shorthand for show({ description, title, variant: 'error' }).",
    },
    {
      name: 'warning(description, title?)',
      type: '(description: string, title?: string) => number',
      description: "ToastService method. Shorthand for show({ description, title, variant: 'warning' }).",
    },
    {
      name: 'info(description, title?)',
      type: '(description: string, title?: string) => number',
      description: "ToastService method. Shorthand for show({ description, title, variant: 'info' }).",
    },
    {
      name: 'dismiss(id)',
      type: '(id: number) => void',
      description: 'ToastService method. Removes a specific toast immediately.',
    },
    {
      name: 'clear()',
      type: '() => void',
      description: 'ToastService method. Removes all queued toasts immediately.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-position', description: "On the container host, e.g. [data-position='top-right'] -- drives corner-pinning styles." },
    { name: 'data-stacked', description: 'On the container host. Present when stacked is set -- switches to the peeking-deck layout.' },
    { name: 'data-expanded', description: 'On the container host. Present when stacked and the group is hovered -- expands the deck into a full list.' },
    { name: 'data-variant', description: "On each toast, e.g. [data-variant='success'] -- drives that severity's background/foreground/border/icon colors." },
    { name: 'data-stack-hidden', description: 'On a toast beyond the max visible stack depth while collapsed -- hides it.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-toast-container', description: 'The flex list/deck wrapping all queued toasts.' },
    { name: '.s-toast', description: 'A single toast card -- background, border, and shadow.' },
    { name: '.s-toast__icon', description: 'The variant icon.' },
    { name: '.s-toast__content', description: 'Wraps the title and description.' },
    { name: '.s-toast__title', description: 'The toast title text.' },
    { name: '.s-toast__description', description: 'The toast description text.' },
    { name: '.s-toast__close', description: 'The dismiss button.' },
    { name: '.s-toast--enter', description: 'Applied while a toast animates in.' },
    { name: '.s-toast--leave', description: 'Applied while a toast animates out.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-toast-gap', description: 'Gap between stacked toasts.' },
    { name: '--semiui-comp-toast-width', description: 'Toast card width.' },
    { name: '--semiui-comp-toast-padding-y', description: 'Vertical padding.' },
    { name: '--semiui-comp-toast-padding-x', description: 'Horizontal padding.' },
    { name: '--semiui-comp-toast-radius', description: 'Corner radius.' },
    { name: '--semiui-comp-toast-shadow', description: 'Box shadow.' },
    { name: '--semiui-comp-toast-blur', description: 'backdrop-filter blur applied behind the card.' },
    {
      name: '--semiui-comp-toast-variants-{variant}-{background,foreground,border}',
      description: 'Per-variant color triad (default, success, error, warning, info).',
    },
    {
      name: '--semiui-comp-toast-variants-{success,error,warning,info}-icon-color',
      description: "Icon color for each non-default variant.",
    },
  ];
}

import { Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CheckboxComponent } from '../../../../components/checkbox/checkbox.component';
import { ToastContainerComponent, ToastPosition } from '../../../../components/toast/toast-container.component';
import { ToastService, ToastTemplateContext } from '../../../../components/toast/toast.service';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

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
      this.toastService.show({ template: tpl, duration: 0 });
    }
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

<ng-template #customToast let-toast let-dismiss="dismiss">
  <div>🎉 Fully custom content <button (click)="dismiss()">Close</button></div>
</ng-template>
// toastService.show({ template: customToastTemplate });`;

  protected readonly stackedCode = `<s-toast-container [stacked]="true" />`;

  protected readonly positionCode = `<s-toast-container position="bottom-right" />`;
}

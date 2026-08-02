import { Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { ToastContainerComponent, ToastPosition } from '../../toast/toast-container.component';
import { ToastService, ToastTemplateContext } from '../../toast/toast.service';

@Component({
  selector: 'app-toast-docs-page',
  imports: [ToastContainerComponent],
  templateUrl: './toast-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class ToastDocsPage {
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

  toggleStacked(): void {
    this.stacked.update((value) => !value);
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
}

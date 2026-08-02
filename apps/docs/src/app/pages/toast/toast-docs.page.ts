import { Component, inject, signal } from '@angular/core';
import { ToastContainerComponent, ToastPosition } from '../../toast/toast-container.component';
import { ToastService } from '../../toast/toast.service';

@Component({
  selector: 'app-toast-docs-page',
  imports: [ToastContainerComponent],
  templateUrl: './toast-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class ToastDocsPage {
  private readonly toastService = inject(ToastService);

  protected position = signal<ToastPosition>('top-right');

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
}

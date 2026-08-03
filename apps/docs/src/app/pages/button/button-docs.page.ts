import { Component, signal } from '@angular/core';
import { ButtonSize, ButtonVariant, IconRef } from '@semiui/tokens';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-button-docs-page',
  imports: [ButtonComponent],
  templateUrl: './button-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class ButtonDocsPage {
  protected variants: ButtonVariant[] = ['primary', 'secondary', 'destructive', 'link'];
  protected severities: ButtonVariant[] = ['success', 'info', 'warn', 'help', 'danger', 'contrast'];
  protected allSeverities: ButtonVariant[] = ['primary', 'secondary', 'success', 'info', 'warn', 'help', 'danger', 'contrast'];
  protected sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  protected loading = signal(false);
  protected saveIcon: IconRef = { type: 'ng-icon', name: 'lucideSave' };

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }
}

import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrorMessageComponent } from '../../error-message/error-message.component';

@Component({
  selector: 'app-error-message-docs-page',
  imports: [ErrorMessageComponent, RouterLink],
  templateUrl: './error-message-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class ErrorMessageDocsPage {
  protected message = signal('This field is required.');

  toggle(): void {
    this.message.update((value) => (value ? '' : 'This field is required.'));
  }
}

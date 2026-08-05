import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { ErrorMessageComponent } from '../../../../components/error-message/error-message.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-error-message-page',
  imports: [
    ErrorMessageComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './error-message-page.component.html',
  styleUrl: './error-message-page.component.css',
})
export class ErrorMessagePageComponent {
  protected message = signal('This field is required.');

  toggle(): void {
    this.message.update((value) => (value ? '' : 'This field is required.'));
  }

  protected readonly usageCode = `<s-error-message [message]="errorMessage()" />`;
}

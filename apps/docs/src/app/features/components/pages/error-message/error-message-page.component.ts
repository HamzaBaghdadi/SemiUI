import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { ErrorMessageComponent } from '../../../../components/error-message/error-message.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-error-message-page',
  imports: [
    ErrorMessageComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
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

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'message',
      type: 'string',
      default: "''",
      description: 'The text to display. Renders nothing (no empty, invisible element) when empty.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-error-message', description: 'The text element itself.' },
    { name: '.s-error-message--enter', description: 'Applied briefly via animate.enter when the message appears.' },
    { name: '.s-error-message--leave', description: 'Applied briefly via animate.leave when the message is cleared.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [];
}

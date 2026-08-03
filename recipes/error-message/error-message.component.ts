import { Component, input } from '@angular/core';

/** Displays an error message with an enter/leave animation. Used standalone or by form components. */
@Component({
  selector: 's-error-message',
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent {
  message = input('');
}

import { Component, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck, lucideCopy } from '@ng-icons/lucide';

/** A dark, copy-to-clipboard code block used across the component reference pages. */
@Component({
  selector: 'app-code-block',
  imports: [NgIcon],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.css',
  providers: [provideIcons({ lucideCopy, lucideClipboardCheck })],
})
export class CodeBlockComponent {
  filename = input('Code');
  code = input.required<string>();

  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}

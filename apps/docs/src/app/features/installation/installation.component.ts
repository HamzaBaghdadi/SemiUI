import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideClipboardCheck,
  lucideCopy,
  lucideTerminal,
} from '@ng-icons/lucide';
import { ButtonComponent } from '../../components/button/button.component';
import { CheckboxComponent } from '../../components/checkbox/checkbox.component';

const SNIPPETS = {
  init: 'npx @semiui/cli init',
  config: `import { provideSemiUI } from '@semiui/theme';
import { Semi, provideSemiIcons } from '@semiui/presets-semi';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...your existing providers
    provideSemiUI({ preset: Semi }),
    provideSemiIcons(),
  ],
};`,
  add: 'npx semiui add button',
  usage: `import { ButtonComponent } from '../components/button/button.component';

@Component({
  selector: 'app-booking-card',
  imports: [ButtonComponent],
  template: \`<s-button variant="primary" (pressed)="confirm()">Confirm</s-button>\`,
})
export class BookingCardComponent {
  confirm() {}
}`,
} as const;

type SnippetId = keyof typeof SNIPPETS;

@Component({
  selector: 'app-installation',
  templateUrl: './installation.component.html',
  styleUrls: ['./installation.component.css'],
  imports: [NgIcon, ButtonComponent, CheckboxComponent],
  providers: [
    provideIcons({ lucideCheck, lucideCopy, lucideClipboardCheck, lucideTerminal }),
  ],
})
export class InstallationComponent {
  private readonly router = inject(Router);
  private readonly copiedId = signal<SnippetId | null>(null);

  protected goHome(): void {
    this.router.navigate(['/home']);
  }

  protected isCopied(id: SnippetId): boolean {
    return this.copiedId() === id;
  }

  protected async copy(id: SnippetId): Promise<void> {
    await navigator.clipboard.writeText(SNIPPETS[id]);
    this.copiedId.set(id);
    setTimeout(() => {
      if (this.copiedId() === id) {
        this.copiedId.set(null);
      }
    }, 1500);
  }
}

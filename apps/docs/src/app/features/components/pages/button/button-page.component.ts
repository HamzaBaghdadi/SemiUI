import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideSave } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../components/button/button.component';
import { ButtonSize, ButtonVariant, IconRef } from '@semiui/tokens';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-button-page',
  imports: [ButtonComponent, RouterLink, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
  templateUrl: './button-page.component.html',
  styleUrl: './button-page.component.css',
  providers: [provideIcons({ lucideSave })],
})
export class ButtonPageComponent {
  protected variants: ButtonVariant[] = ['primary', 'secondary', 'destructive', 'link'];
  protected severities: ButtonVariant[] = ['success', 'info', 'warn', 'help', 'danger', 'contrast'];
  protected allSeverities: ButtonVariant[] = ['primary', 'secondary', 'success', 'info', 'warn', 'help', 'danger', 'contrast'];
  protected sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  protected loading = signal(false);
  protected saveIcon: IconRef = { type: 'ng-icon', name: 'lucideSave' };

  protected readonly variantsCode = `<s-button variant="primary">primary</s-button>
<s-button variant="destructive">destructive</s-button>`;

  protected readonly severityCode = `<s-button variant="success">success</s-button>
<s-button variant="info">info</s-button>
<s-button variant="warn">warn</s-button>
<s-button variant="help">help</s-button>
<s-button variant="danger">danger</s-button>
<s-button variant="contrast">contrast</s-button>`;

  protected readonly outlinedTextCode = `<s-button variant="success" [outlined]="true">success</s-button>
<s-button variant="danger" [text]="true">danger</s-button>`;

  protected readonly sizesCode = `<s-button size="sm">Small</s-button>`;

  protected readonly iconOnlyCode = `<s-button icon [iconLeading]="{ type: 'ng-icon', name: 'lucideSave' }" aria-label="Save" />`;

  protected readonly iconCode = `<s-button [iconLeading]="{ type: 'ng-icon', name: 'lucideSave' }">Save</s-button>`;

  protected readonly loadingCode = `<s-button [loading]="isSubmitting()">Submit</s-button>`;

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }
}

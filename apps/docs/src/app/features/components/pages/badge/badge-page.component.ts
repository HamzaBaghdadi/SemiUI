import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideStar } from '@ng-icons/lucide';
import { IconRef } from '@semiui/tokens';
import { RouterLink } from '@angular/router';
import { BadgeComponent, BadgePosition } from '../../../../components/badge/badge.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-badge-page',
  imports: [
    BadgeComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './badge-page.component.html',
  styleUrl: './badge-page.component.css',
  providers: [provideIcons({ lucideStar })],
})
export class BadgePageComponent {
  protected count = signal(3);
  protected positions: BadgePosition[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
  protected starIcon: IconRef = { type: 'ng-icon', name: 'lucideStar' };

  protected readonly textIconCode = `<s-badge label="NEW" variant="info" [standalone]="true" />
<s-badge [icon]="starIcon" variant="warn" [standalone]="true" ariaLabel="Featured" />`;

  protected readonly overlayCode = `<s-badge [count]="unreadCount">
  <button aria-label="Notifications">🔔</button>
</s-badge>`;

  protected readonly maxCode = `<s-badge [count]="150" [max]="99">...</s-badge>  <!-- shows "99+" -->`;

  protected readonly dotCode = `<s-badge [dot]="true" variant="destructive">...</s-badge>`;

  protected readonly positionCode = `<s-badge [count]="1" position="bottom-left" variant="secondary">...</s-badge>`;

  protected readonly severityCode = `<s-badge [count]="1" variant="success" [standalone]="true" />`;

  protected readonly standaloneCode = `<span>Inbox</span>
<s-badge [count]="5" [standalone]="true" />`;

  increment(): void {
    this.count.update((value) => value + 1);
  }
}

import { Component, signal } from '@angular/core';
import { BadgeComponent, BadgePosition } from '../../badge/badge.component';

@Component({
  selector: 'app-badge-docs-page',
  imports: [BadgeComponent],
  templateUrl: './badge-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class BadgeDocsPage {
  protected count = signal(3);
  protected positions: BadgePosition[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];

  increment(): void {
    this.count.update((value) => value + 1);
  }
}

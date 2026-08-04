import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagComponent } from '../../../../components/tag/tag.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-tag-page',
  imports: [TagComponent, RouterLink, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
  templateUrl: './tag-page.component.html',
  styleUrl: './tag-page.component.css',
})
export class TagPageComponent {
  protected skills = signal(['Angular', 'TypeScript', 'RxJS', 'CSS']);

  protected readonly variantsCode = `<s-tag variant="primary">Primary</s-tag>`;

  protected readonly severityCode = `<s-tag variant="success">Success</s-tag>`;

  protected readonly iconCode = `<s-tag [icon]="{ type: 'ng-icon', name: 'lucideCheck' }">Verified</s-tag>`;

  protected readonly removableCode = `<s-tag [removable]="true" (removed)="onRemove(skill)">{{ skill }}</s-tag>`;

  remove(skill: string): void {
    this.skills.update((current) => current.filter((s) => s !== skill));
  }
}

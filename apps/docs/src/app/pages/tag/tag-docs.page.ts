import { Component, signal } from '@angular/core';
import { TagComponent } from '../../tag/tag.component';

@Component({
  selector: 'app-tag-docs-page',
  imports: [TagComponent],
  templateUrl: './tag-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class TagDocsPage {
  protected skills = signal(['Angular', 'TypeScript', 'RxJS', 'CSS']);

  remove(skill: string): void {
    this.skills.update((current) => current.filter((s) => s !== skill));
  }
}

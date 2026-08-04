import { Component, computed, input } from '@angular/core';
import { CodeBlockComponent } from '../code-block/code-block.component';

/** The title block every component reference page starts with: category, name, blurb, install command. */
@Component({
  selector: 'app-component-page-header',
  imports: [CodeBlockComponent],
  templateUrl: './component-page-header.component.html',
  styleUrl: './component-page-header.component.css',
})
export class ComponentPageHeaderComponent {
  category = input.required<string>();
  name = input.required<string>();
  description = input.required<string>();
  slug = input.required<string>();

  protected readonly installCommand = computed(() => `npx semiui add ${this.slug()}`);
}

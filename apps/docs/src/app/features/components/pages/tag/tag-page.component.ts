import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagComponent } from '../../../../components/tag/tag.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-tag-page',
  imports: [
    TagComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
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

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'variant',
      type: "'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'",
      default: "'default'",
      description: 'Visual style. Shares the same semantic color vocabulary as Button and Badge.',
    },
    {
      name: 'icon',
      type: 'IconRef',
      default: 'undefined',
      description: 'Optional leading icon.',
    },
    {
      name: 'removable',
      type: 'boolean',
      default: 'false',
      description: 'Shows a trailing remove button that emits removed when clicked.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'removed',
      type: 'EventEmitter<void>',
      description: 'Emitted when the remove button is clicked, if removable is set.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-variant', description: "The active variant, e.g. [data-variant='primary'] -- drives the color tokens read below." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-tag__icon', description: 'The optional leading icon.' },
    { name: '.s-tag__label', description: "The tag's text content." },
    { name: '.s-tag__remove', description: 'The trailing remove button, shown when removable is set.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-tag-padding-x', description: 'Horizontal padding.' },
    { name: '--semiui-comp-tag-padding-y', description: 'Vertical padding.' },
    { name: '--semiui-comp-tag-radius', description: 'Corner radius.' },
    { name: '--semiui-comp-tag-font-size', description: 'Label font size.' },
    {
      name: '--semiui-comp-tag-variants-{variant}-{background,foreground,border}',
      description: 'Per-variant color triad (default, primary, secondary, destructive, outline, danger, success, info, warn, help, contrast).',
    },
  ];
}

import { Component } from '@angular/core';
import { DividerComponent } from '../../../../components/divider/divider.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-divider-page',
  imports: [
    DividerComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './divider-page.component.html',
  styleUrl: './divider-page.component.css',
})
export class DividerPageComponent {
  protected readonly plainCode = `<s-divider />`;
  protected readonly labelCode = `<s-divider>OR</s-divider>`;
  protected readonly verticalCode = `<s-divider orientation="vertical" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Line direction. vertical stretches to fill the height of a flex row instead of the width of a column.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-orientation', description: "The active orientation, e.g. [data-orientation='vertical'] -- also mirrored to aria-orientation." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-divider__label', description: 'The centered label wrapping any projected content; collapses to display: none when empty.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [];
}

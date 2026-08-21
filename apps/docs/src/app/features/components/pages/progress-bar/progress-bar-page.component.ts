import { Component, signal } from '@angular/core';
import { ProgressBarComponent } from '../../../../components/progress-bar/progress-bar.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-progress-bar-page',
  imports: [
    ProgressBarComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './progress-bar-page.component.html',
  styleUrl: './progress-bar-page.component.css',
})
export class ProgressBarPageComponent {
  protected readonly value = signal(40);

  protected readonly basicCode = `<s-progress-bar [value]="40" />
<s-progress-bar [value]="70" [showValue]="true" />`;

  protected readonly indeterminateCode = `<s-progress-bar [indeterminate]="true" />`;

  protected readonly sizesCode = `<s-progress-bar size="sm" [value]="60" />
<s-progress-bar size="md" [value]="60" />
<s-progress-bar size="lg" [value]="60" />`;

  protected readonly colorsCode = `<s-progress-bar color="success" [value]="80" />
<s-progress-bar color="warn" [value]="55" />
<s-progress-bar color="danger" [value]="20" />`;

  protected readonly apiProps: ApiPropRow[] = [
    { name: 'value', type: 'number', default: '0', description: 'Progress, 0-100. Ignored when indeterminate is set.' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows an unbounded loading loop instead of a fixed value.' },
    { name: 'showValue', type: 'boolean', default: 'false', description: 'Shows the numeric percentage alongside the bar.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Controls the track's height." },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'",
      default: "'primary'",
      description: "The fill color, reusing Button's own variant tokens.",
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-size', description: 'The active size, set on the host.' },
    { name: 'data-color', description: 'The active color, set on the host.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-progress-bar__track', description: 'The background rail.' },
    { name: '.s-progress-bar__fill', description: 'The filled portion.' },
    { name: '.s-progress-bar__fill--indeterminate', description: 'Applied while indeterminate, driving the sweeping animation.' },
    { name: '.s-progress-bar__label', description: 'The percentage text, shown when showValue is set.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-button-variants-*-background', description: "Reused for each color, via --s-progress-bar-color." },
    { name: '--semiui-color-muted', description: "The track's background." },
    { name: '--semiui-color-muted-foreground', description: 'The percentage label color.' },
  ];
}

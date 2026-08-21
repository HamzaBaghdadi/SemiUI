import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '../../../../components/tooltip/tooltip.directive';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-tooltip-page',
  imports: [
    TooltipDirective,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './tooltip-page.component.html',
  styleUrl: './tooltip-page.component.css',
})
export class TooltipPageComponent {
  protected readonly basicUsageCode = `<button [sTooltip]="'Saves your changes'">Hover or focus me</button>`;

  protected readonly delayCode = `<button [sTooltip]="'Appears instantly'" [tooltipDelay]="0">No delay</button>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'sTooltip',
      type: 'string',
      default: "''",
      description: 'The tooltip text. Omit or pass an empty string to disable the tooltip entirely.',
    },
    {
      name: 'tooltipPlacement',
      type: "'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'",
      default: "'top'",
      description: "start/end follow reading direction and flip under RTL; left/right pin to that literal physical side regardless of direction. Automatically flips top<->bottom when there isn't room.",
    },
    {
      name: 'tooltipDelay',
      type: 'number',
      default: '300',
      description: 'Delay, in milliseconds, before the tooltip appears after hover/focus starts.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-placement', description: "On the floating panel, e.g. [data-placement='top'] -- the resolved physical side, drives the arrow position." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-tooltip', description: 'The floating panel -- background, padding, and the arrow pseudo-element.' },
    { name: '.s-tooltip--enter', description: 'Applied on show to fade the panel in.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-tooltip-padding-y', description: 'Vertical padding.' },
    { name: '--semiui-comp-tooltip-padding-x', description: 'Horizontal padding.' },
    { name: '--semiui-comp-tooltip-background', description: 'Background color (also used by the arrow).' },
    { name: '--semiui-comp-tooltip-foreground', description: 'Text color.' },
    { name: '--semiui-comp-tooltip-radius', description: 'Corner radius.' },
    { name: '--semiui-comp-tooltip-font-size', description: 'Font size.' },
  ];
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '../../../../components/tooltip/tooltip.directive';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-tooltip-page',
  imports: [
    TooltipDirective,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './tooltip-page.component.html',
  styleUrl: './tooltip-page.component.css',
})
export class TooltipPageComponent {
  protected readonly basicUsageCode = `<button [sTooltip]="'Saves your changes'">Hover or focus me</button>`;

  protected readonly delayCode = `<button [sTooltip]="'Appears instantly'" [tooltipDelay]="0">No delay</button>`;
}

import { Component } from '@angular/core';
import { TooltipDirective } from '../../tooltip/tooltip.directive';

@Component({
  selector: 'app-tooltip-docs-page',
  imports: [TooltipDirective],
  templateUrl: './tooltip-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class TooltipDocsPage {}

import { Component, input } from '@angular/core';
import { TooltipPlacement } from './tooltip.directive';

/** Internal: the floating panel rendered dynamically by `TooltipDirective`. Not meant to be used directly. */
@Component({
  selector: 's-tooltip-panel',
  templateUrl: './tooltip-panel.component.html',
  styleUrl: './tooltip-panel.component.css',
})
export class TooltipPanelComponent {
  text = input('');
  placement = input<TooltipPlacement>('top');
  top = input(0);
  left = input(0);
}

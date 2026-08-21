import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../components/button/button.component';
import { PopoverComponent } from '../../../../components/popover/popover.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-popover-page',
  imports: [
    PopoverComponent,
    ButtonComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './popover-page.component.html',
  styleUrl: './popover-page.component.css',
})
export class PopoverPageComponent {
  protected readonly basicUsageCode = `<s-button (click)="po.toggle($event)">Click to show popover</s-button>

<s-popover #po>
  <span>Popover opened!</span>
</s-popover>`;

  protected readonly separateTriggersCode = `<s-button (click)="po.show($event)">Show</s-button>
<s-button (click)="po.hide()">Hide</s-button>
<s-popover #po placement="right">...</s-popover>`;

  protected readonly appendToCode = `<s-popover #po appendTo="body">...</s-popover>`;

  protected readonly alignCode = `<s-popover #po align="start">...</s-popover>  <!-- "start" | "center" (default) | "end" -->`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'placement',
      type: "'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'",
      default: "'bottom'",
      description: "'start'/'end' follow reading direction and flip under RTL; 'left'/'right' pin to that literal physical side regardless of direction. Flips top/bottom automatically when there isn't room.",
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: "Where the panel lands along the cross-axis relative to the anchor, independent of placement. 'start'/'end' follow reading direction the same way placement's start/end does.",
    },
    {
      name: 'offset',
      type: 'number',
      default: '8',
      description: 'Gap, in pixels, between the anchor element and the popover panel.',
    },
    {
      name: 'closeOnOutsideClick',
      type: 'boolean',
      default: 'true',
      description: 'Closes the popover when clicking outside the panel and the anchor.',
    },
    {
      name: 'closeOnEscape',
      type: 'boolean',
      default: 'true',
      description: 'Closes the popover on Escape and returns focus to the anchor.',
    },
    {
      name: 'closeOnScroll',
      type: 'boolean',
      default: 'true',
      description: 'Hides the popover on scroll instead of repositioning it to follow the anchor.',
    },
    {
      name: 'showArrow',
      type: 'boolean',
      default: 'true',
      description: "Renders a small triangle that tracks the anchor's actual position, clamped to stay clear of the panel's corners.",
    },
    {
      name: 'appendTo',
      type: "'body' | null",
      default: 'null',
      description: "Moves the panel to a direct child of document.body, escaping any ancestor's overflow: hidden clipping or transform/filter stacking context.",
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-placement', description: "The resolved side the panel opened on, e.g. [data-placement='bottom'] -- may differ from the placement input after auto-flipping." },
    { name: 'data-arrow', description: 'Present when showArrow is set -- enables the ::after arrow triangle.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-popover', description: 'The panel element carrying background, border, shadow, and typography.' },
    { name: '.s-popover--enter', description: 'Applied briefly while the panel enters (scale + fade in).' },
    { name: '.s-popover--leave', description: 'Applied briefly while the panel leaves (scale + fade out).' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-popover-padding-{x,y}', description: 'Panel padding.' },
    { name: '--semiui-comp-popover-background', description: 'Panel (and arrow) background.' },
    { name: '--semiui-comp-popover-foreground', description: 'Panel text color.' },
    { name: '--semiui-comp-popover-border', description: 'Panel (and arrow) border color.' },
    { name: '--semiui-comp-popover-radius', description: 'Panel corner radius.' },
    { name: '--semiui-comp-popover-shadow', description: 'Panel drop shadow.' },
  ];
}

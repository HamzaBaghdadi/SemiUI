import { Component } from '@angular/core';
import { ScrollTopComponent } from '../../../../components/scroll-top/scroll-top.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-scroll-top-page',
  imports: [
    ScrollTopComponent,
    ComponentPageHeaderComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './scroll-top-page.component.html',
  styleUrl: './scroll-top-page.component.css',
})
export class ScrollTopPageComponent {
  protected readonly basicCode = `<s-scroll-top />`;

  protected readonly customCode = `<s-scroll-top [threshold]="500" variant="secondary" ariaLabel="Back to top" />`;

  protected readonly apiProps: ApiPropRow[] = [
    { name: 'threshold', type: 'number', default: '300', description: 'Scroll distance (px) past which the button appears.' },
    { name: 'smooth', type: 'boolean', default: 'true', description: 'Animates the scroll instead of jumping instantly.' },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'destructive' | 'link' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'",
      default: "'primary'",
      description: "The button's color, reusing Button's own variant tokens.",
    },
    {
      name: 'icon',
      type: 'IconRef',
      default: 'undefined',
      description: "Overrides the default icon (chevronDown, rotated 180deg -- there's no dedicated 'up' glyph in the shared icon set).",
    },
    { name: 'ariaLabel', type: 'string', default: "'Scroll to top'", description: "The button's accessible name." },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-visible', description: 'Present once scrolled past threshold, set on the host.' },
    { name: 'data-variant', description: 'The active variant, set on the host.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [{ name: '.s-scroll-top__button', description: 'The floating circular button.' }];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-button-variants-*-*', description: 'Reused for each variant, via --s-scroll-top-bg/border/fg.' },
    { name: '--semiui-comp-popover-shadow', description: "Reused for the button's elevation -- both are floating-above-the-page UI." },
    { name: '--semiui-comp-button-focus-ring', description: 'The focus ring color.' },
  ];
}

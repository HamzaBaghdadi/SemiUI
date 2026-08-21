import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideStar } from '@ng-icons/lucide';
import { IconRef } from '@semiui/tokens';
import { RouterLink } from '@angular/router';
import { BadgeComponent, BadgePosition } from '../../../../components/badge/badge.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-badge-page',
  imports: [
    BadgeComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './badge-page.component.html',
  styleUrl: './badge-page.component.css',
  providers: [provideIcons({ lucideStar })],
})
export class BadgePageComponent {
  protected count = signal(3);
  protected positions: BadgePosition[] = [
    'top-right',
    'top-left',
    'bottom-right',
    'bottom-left',
    'top-start',
    'top-end',
    'bottom-start',
    'bottom-end',
  ];
  protected starIcon: IconRef = { type: 'ng-icon', name: 'lucideStar' };

  protected readonly textIconCode = `<s-badge label="NEW" variant="info" [standalone]="true" />
<s-badge [icon]="starIcon" variant="warn" [standalone]="true" ariaLabel="Featured" />`;

  protected readonly overlayCode = `<s-badge [count]="unreadCount">
  <button aria-label="Notifications">🔔</button>
</s-badge>`;

  protected readonly maxCode = `<s-badge [count]="150" [max]="99">...</s-badge>  <!-- shows "99+" -->`;

  protected readonly dotCode = `<s-badge [dot]="true" variant="destructive">...</s-badge>`;

  protected readonly positionCode = `<s-badge [count]="1" position="bottom-left" variant="secondary">...</s-badge>
<!-- "top-right" | "top-left" | "bottom-right" | "bottom-left" (physical, pinned)
     | "top-start" | "top-end" | "bottom-start" | "bottom-end" (mirror under RTL) -->`;

  protected readonly severityCode = `<s-badge [count]="1" variant="success" [standalone]="true" />`;

  protected readonly standaloneCode = `<span>Inbox</span>
<s-badge [count]="5" [standalone]="true" />`;

  increment(): void {
    this.count.update((value) => value + 1);
  }

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'count',
      type: 'number',
      default: 'undefined',
      description: 'Number shown as content, rendered as "N+" once past max. Lowest-priority content source.',
    },
    {
      name: 'label',
      type: 'string',
      default: 'undefined',
      description: "Arbitrary text content, e.g. \"NEW\" or \"Beta\" -- takes priority over count when set.",
    },
    {
      name: 'icon',
      type: 'IconRef',
      default: 'undefined',
      description: 'Renders this icon as the badge\'s content instead of text -- takes priority over both label and count.',
    },
    {
      name: 'max',
      type: 'number',
      default: '99',
      description: 'Ceiling for count before it displays as "max+".',
    },
    {
      name: 'dot',
      type: 'boolean',
      default: 'false',
      description: 'Renders a plain filled circle instead of any text/icon content.',
    },
    {
      name: 'showZero',
      type: 'boolean',
      default: 'false',
      description: 'Shows the badge even when count is exactly 0 (default hides it). Irrelevant when label/icon is set.',
    },
    {
      name: 'variant',
      type: 'TagVariant',
      default: "'primary'",
      description: 'Visual color -- the same semantic vocabulary as Button and Tag, plus default/secondary/outline.',
    },
    {
      name: 'position',
      type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'",
      default: "'top-right'",
      description: 'Corner the badge overlays. The four physical values pin to that literal corner; the start/end values mirror under RTL.',
    },
    {
      name: 'standalone',
      type: 'boolean',
      default: 'false',
      description: 'Renders inline instead of as an absolutely-positioned overlay on the projected content.',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: 'undefined',
      description: 'Overrides the auto-generated aria-label. Useful with icon alone, since it has no default text to announce.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-standalone', description: 'Present on the host when standalone is set -- switches the badge from absolute overlay to inline static layout.' },
    { name: 'data-variant', description: "The active variant, e.g. [data-variant='primary'] -- drives the badge's color tokens (on .s-badge)." },
    { name: 'data-position', description: "The active position, e.g. [data-position='top-right'] -- drives the badge's corner offset (on .s-badge)." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-badge-wrapper', description: 'The relatively-positioned wrapper around the projected content and the badge itself.' },
    { name: '.s-badge', description: 'The badge pill/dot carrying background, border, and typography.' },
    { name: '.s-badge--dot', description: 'Applied when dot is set -- shrinks the badge to a small filled circle.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-badge-size', description: 'Minimum width/height of the non-dot badge.' },
    { name: '--semiui-comp-badge-dot-size', description: 'Width/height of the badge when dot is set.' },
    { name: '--semiui-comp-badge-ring-color', description: 'Border color that rings the overlay badge (creates separation from the wrapped content).' },
    { name: '--semiui-comp-badge-font-size', description: 'Font size of label/count content.' },
    {
      name: '--semiui-comp-badge-variants-{variant}-{background,foreground,border}',
      description: 'Per-variant color triad (default, primary, secondary, destructive, danger, success, info, warn, help, contrast, outline). border only applies to outline.',
    },
  ];
}

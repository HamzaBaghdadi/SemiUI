import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-drawer-page',
  imports: [
    DrawerComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './drawer-page.component.html',
  styleUrl: './drawer-page.component.css',
})
export class DrawerPageComponent {
  protected readonly basicUsageCode = `<s-button (click)="dr.show()">Open drawer</s-button>

<s-drawer #dr title="Edit profile">
  <p>Drawer content</p>
  <ng-template #footer>
    <s-button [outlined]="true" (click)="dr.hide()">Cancel</s-button>
    <s-button (click)="dr.hide()">Save</s-button>
  </ng-template>
</s-drawer>`;

  protected readonly sidesCode = `<s-drawer #dr side="left">...</s-drawer>  <!-- "left" | "right" (default) | "top" | "bottom" | "start" | "end" -->`;

  protected readonly sizesCode = `<s-drawer #dr size="sm">...</s-drawer>  <!-- "sm" | "md" (default) | "lg" | "full" -->`;

  protected readonly headlessCode = `<s-drawer #dr>
  <ng-template #headless>
    <div class="my-custom-drawer">...</div>
  </ng-template>
</s-drawer>`;

  protected readonly backdropCode = `<s-drawer #dr [blurBackdrop]="true">...</s-drawer>
<s-drawer #dr [showBackdrop]="false">...</s-drawer>`;

  /** Query selector string must match the template's #spotlightTrigger ref -- named differently
   * here (spotlightTriggerEl) so the template expression `spotlightTriggerEl()` isn't shadowed by
   * that same-named local template reference variable, which would resolve to the ButtonComponent
   * instance instead of this signal. */
  protected readonly spotlightTriggerEl = viewChild<unknown, ElementRef<HTMLElement>>('spotlightTrigger', { read: ElementRef });

  protected readonly spotlightCode = `protected trigger = viewChild('trigger', { read: ElementRef });

<s-button #trigger (click)="dr.show()">Open drawer</s-button>

<s-drawer #dr [focusedElement]="trigger() ?? null">...</s-drawer>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'title',
      type: 'string',
      default: "''",
      description: 'Plain text title shown in the header. Ignored when the #header template is projected.',
    },
    {
      name: 'side',
      type: "'left' | 'right' | 'top' | 'bottom' | 'start' | 'end'",
      default: "'right'",
      description: "left/right pin to that literal physical edge regardless of page direction; start/end follow reading direction and flip under RTL.",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'full'",
      default: "'md'",
      description: "Controls the panel's width (left/right/start/end drawers) or height (top/bottom drawers) via the size-scoped tokens.",
    },
    {
      name: 'closable',
      type: 'boolean',
      default: 'true',
      description: 'Shows the "x" close button in the header.',
    },
    {
      name: 'closeOnOutsideClick',
      type: 'boolean',
      default: 'true',
      description: 'Clicking the backdrop closes the drawer.',
    },
    {
      name: 'closeOnEscape',
      type: 'boolean',
      default: 'true',
      description: 'Pressing Escape closes the drawer.',
    },
    {
      name: 'blurBackdrop',
      type: 'boolean',
      default: 'false',
      description: 'Blurs whatever is behind the backdrop, in addition to dimming it.',
    },
    {
      name: 'showBackdrop',
      type: 'boolean',
      default: 'true',
      description: "Hides the dimming/blur backdrop entirely -- the panel still portals, traps focus, and locks scroll, it just doesn't visually cover the page behind it.",
    },
    {
      name: 'focusedElement',
      type: 'HTMLElement | ElementRef<HTMLElement> | null',
      default: 'null',
      description: 'An element to keep fully visible above the backdrop as a "spotlight" cutout, instead of dimmed with the rest of the page -- measured once when the drawer opens.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-spotlight', description: 'Present on .s-drawer__backdrop when focusedElement resolved to an element -- the backdrop drops its own flat background, since the dimming has moved onto .s-drawer__spotlight instead.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-drawer__backdrop', description: 'The fixed, full-viewport dimming layer behind the panel.' },
    { name: '.s-drawer__spotlight', description: 'Present when focusedElement is set -- a transparent cutout positioned over that element, dimming everything else via a large box-shadow.' },
    { name: '.s-drawer__panel', description: 'The sliding panel itself: background, border, shadow, and width/height per side and size.' },
    { name: '.s-drawer__header', description: 'Wraps the title (or #header template) and close button.' },
    { name: '.s-drawer__title', description: 'The plain-text title element.' },
    { name: '.s-drawer__close', description: 'The "x" close button.' },
    { name: '.s-drawer__body', description: 'The scrollable content area, projecting default (non-headless) content.' },
    { name: '.s-drawer__footer', description: 'Wraps the #footer template, if projected.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-comp-dialog-*',
      description: "Drawer intentionally shares Dialog's tokens (backdrop-color, widths-{sm,md,lg,full} for panel width/height, panel-background, panel-border, shadow, padding, header-border, footer-border, title-font-size, title-font-weight) -- same chrome, different geometry.",
    },
  ];
}

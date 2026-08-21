import { Component } from '@angular/core';
import { AvatarComponent } from '../../../../components/avatar/avatar.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-avatar-page',
  imports: [
    AvatarComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './avatar-page.component.html',
  styleUrl: './avatar-page.component.css',
})
export class AvatarPageComponent {
  protected readonly fallbackCode = `<s-avatar src="https://example.com/photo.jpg" name="Ada Lovelace" />  <!-- image -->
<s-avatar name="Grace Hopper" />  <!-- initials: GH -->
<s-avatar />  <!-- generic icon -->`;

  protected readonly sizesCode = `<s-avatar size="sm" />  <!-- also "md" (default), "lg", "xl" -->`;

  protected readonly shapeCode = `<s-avatar shape="square" />  <!-- default is "circle" -->`;

  protected readonly statusCode = `<s-avatar status="online" />  <!-- also "away", "busy", "offline" -->`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'src',
      type: 'string',
      default: 'undefined',
      description: 'Image URL. Falls back to initials (or the generic icon) automatically on load failure.',
    },
    {
      name: 'alt',
      type: 'string',
      default: "''",
      description: 'Alt text for the image, and the accessible label for the fallback icon.',
    },
    {
      name: 'name',
      type: 'string',
      default: "''",
      description: 'Used to derive initials (e.g. "Ada Lovelace" -> "AL") when there\'s no image.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      default: "'md'",
      description: 'Controls the avatar diameter and initials font size.',
    },
    {
      name: 'shape',
      type: "'circle' | 'square'",
      default: "'circle'",
      description: 'Clipping shape of the avatar.',
    },
    {
      name: 'status',
      type: "'online' | 'away' | 'busy' | 'offline'",
      default: 'undefined',
      description: 'Shows a small status dot at the corner when set; omitted entirely otherwise.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-size', description: "The active size, e.g. [data-size='md'] -- drives the avatar's size and font-size tokens (host attribute)." },
    { name: 'data-shape', description: "The active shape, e.g. [data-shape='square'] -- switches the inner element's border radius (host attribute)." },
    { name: 'data-status', description: "The active status, e.g. [data-status='online'] -- drives the status dot's color (on .s-avatar__status)." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-avatar', description: 'The outer sizing box.' },
    { name: '.s-avatar__inner', description: 'The clipped (border-radius + overflow: hidden) wrapper holding the image, initials, or fallback icon.' },
    { name: '.s-avatar__image', description: 'The <img> element, when src is set and hasn\'t failed to load.' },
    { name: '.s-avatar__initials', description: 'The initials text, when there\'s no (working) image.' },
    { name: '.s-avatar__fallback-icon', description: 'The generic person icon, when there\'s neither image nor name.' },
    { name: '.s-avatar__status', description: 'The small status dot positioned at the avatar\'s corner.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-avatar-size-{sm,md,lg,xl}', description: 'Diameter per size.' },
    { name: '--semiui-comp-avatar-font-size-{sm,md,lg,xl}', description: 'Initials font size per size.' },
    { name: '--semiui-comp-avatar-background', description: 'Background color behind the image/initials/icon.' },
    { name: '--semiui-comp-avatar-foreground', description: 'Color of the initials text and fallback icon.' },
    { name: '--semiui-comp-avatar-radius', description: 'Corner radius when shape is square.' },
    { name: '--semiui-comp-avatar-status-{online,away,busy,offline}', description: 'Status dot color per status value.' },
  ];
}

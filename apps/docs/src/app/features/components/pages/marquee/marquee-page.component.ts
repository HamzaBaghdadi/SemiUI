import { Component } from '@angular/core';
import { MarqueeComponent } from '../../../../components/marquee/marquee.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-marquee-page',
  imports: [
    MarqueeComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './marquee-page.component.html',
  styleUrl: './marquee-page.component.css',
})
export class MarqueePageComponent {
  protected readonly logos = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Soylent', 'Stark', 'Wayne', 'Hooli'];

  protected readonly basicCode = `<s-marquee>
  <span>Breaking news -- SemiUI ships a Marquee component -- more at eleven</span>
</s-marquee>`;

  protected readonly logosCode = `<s-marquee [duration]="20">
  @for (logo of logos; track logo) {
    <span class="font-semibold text-muted-foreground">{{ logo }}</span>
  }
</s-marquee>`;

  protected readonly rightCode = `<s-marquee direction="right" [duration]="10">...</s-marquee>`;

  protected readonly verticalCode = `<s-marquee direction="up" style="height: 8rem">
  @for (logo of logos; track logo) {
    <div>{{ logo }}</div>
  }
</s-marquee>`;

  protected readonly apiProps: ApiPropRow[] = [
    { name: 'direction', type: "'left' | 'right' | 'up' | 'down'", default: "'left'", description: 'Scroll direction. up/down need a bounded height set on the host by the consumer.' },
    { name: 'duration', type: 'number', default: '15', description: 'Seconds for one full loop -- lower is faster.' },
    { name: 'pauseOnHover', type: 'boolean', default: 'true', description: 'Pauses the animation while the pointer is over the marquee.' },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-marquee__track', description: 'The animated flex row (or column) holding both content copies.' },
    { name: '.s-marquee__content', description: 'One copy of the projected content -- rendered twice for a seamless loop.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--s-marquee-duration', description: 'The loop duration, set from the duration input.' },
    { name: '--semiui-spacing-lg', description: 'The gap between the end of one content copy and the start of the next.' },
  ];
}

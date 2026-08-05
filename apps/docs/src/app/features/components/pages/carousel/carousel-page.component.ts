import { Component } from '@angular/core';
import { CarouselComponent } from '../../../../components/carousel/carousel.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

interface Slide {
  color: string;
  label: string;
}

@Component({
  selector: 'app-carousel-page',
  imports: [CarouselComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
  templateUrl: './carousel-page.component.html',
  styleUrl: './carousel-page.component.css',
})
export class CarouselPageComponent {
  protected slides: Slide[] = [
    { color: '#ef4444', label: 'Slide 1' },
    { color: '#f59e0b', label: 'Slide 2' },
    { color: '#22c55e', label: 'Slide 3' },
    { color: '#3b82f6', label: 'Slide 4' },
  ];

  protected readonly basicUsageCode = `protected slides = [
  { color: '#ef4444', label: 'Slide 1' },
  { color: '#f59e0b', label: 'Slide 2' },
];

<s-carousel [items]="slides">
  <ng-template #slide let-item>
    <div [style.background]="item.color">{{ item.label }}</div>
  </ng-template>
</s-carousel>`;

  protected readonly autoplayCode = `<s-carousel [items]="slides" [autoplay]="true" [autoplayInterval]="2000">...</s-carousel>
<!-- pauses automatically while hovered -->`;

  protected readonly noLoopCode = `<s-carousel [items]="slides" [loop]="false" [showDots]="false">...</s-carousel>`;

  protected readonly itemsPerViewCode = `<s-carousel [items]="slides" [itemsPerView]="2">...</s-carousel>`;

  protected readonly arrowsOutsideCode = `<s-carousel [items]="slides" [arrowsOutside]="true">...</s-carousel>`;
}

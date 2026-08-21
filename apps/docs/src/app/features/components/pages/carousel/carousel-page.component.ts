import { Component } from '@angular/core';
import { CarouselComponent } from '../../../../components/carousel/carousel.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface Slide {
  color: string;
  label: string;
}

@Component({
  selector: 'app-carousel-page',
  imports: [
    CarouselComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
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

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'items',
      type: 'readonly TItem[]',
      default: '[]',
      description: 'Slides to render; each is passed to the required #slide template.',
    },
    {
      name: 'activeIndex',
      type: 'number (two-way, model)',
      default: '0',
      description: 'The visible slide\'s (leading, when itemsPerView > 1) index. Bind with [(activeIndex)].',
    },
    {
      name: 'loop',
      type: 'boolean',
      default: 'true',
      description: 'Wraps from the last slide back to the first (and vice versa) instead of stopping at the ends -- arrows disable at the ends when false.',
    },
    {
      name: 'autoplay',
      type: 'boolean',
      default: 'false',
      description: 'Automatically advances slides. Pauses while the carousel is hovered.',
    },
    {
      name: 'autoplayInterval',
      type: 'number',
      default: '4000',
      description: 'Milliseconds between automatic slide advances.',
    },
    {
      name: 'showArrows',
      type: 'boolean',
      default: 'true',
      description: 'Shows the previous/next arrow buttons.',
    },
    {
      name: 'showDots',
      type: 'boolean',
      default: 'true',
      description: 'Shows the dot indicators below the carousel.',
    },
    {
      name: 'itemsPerView',
      type: 'number',
      default: '1',
      description: 'How many slides are visible at once. next()/previous() still move the window by a single slide.',
    },
    {
      name: 'arrowsOutside',
      type: 'boolean',
      default: 'false',
      description: 'Renders the arrow buttons as flex siblings flanking the viewport instead of floating on top of the slides.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'activeIndexChange',
      type: 'EventEmitter<number>',
      description: 'Emitted whenever activeIndex changes -- the write side of the [(activeIndex)] two-way binding.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-carousel', description: 'The focusable root region, carrying keyboard/pointer handlers.' },
    { name: '.s-carousel__viewport', description: 'The clipping window; touch-action: pan-y so vertical page scroll still works.' },
    { name: '.s-carousel__track', description: 'The flex row of slides, translated via transform to reveal activeIndex.' },
    { name: '.s-carousel__track--dragging', description: 'Applied while a pointer drag is in progress -- disables the transform transition for 1:1 tracking.' },
    { name: '.s-carousel__slide', description: 'Each slide wrapper; width is 100% / itemsPerView.' },
    { name: '.s-carousel__arrow', description: 'Previous/next button, floating over the slides by default.' },
    { name: '.s-carousel__arrow--outside', description: 'Applied when arrowsOutside is set -- lays the arrow out as a static flex sibling instead.' },
    { name: '.s-carousel__dots', description: 'The row of dot indicator buttons.' },
    { name: '.s-carousel__dot', description: "Each dot; [aria-selected='true'] marks the active one." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-carousel-radius', description: 'Corner radius of the viewport and the focus ring.' },
    { name: '--semiui-comp-carousel-arrow-size', description: 'Diameter of the arrow buttons.' },
    { name: '--semiui-comp-carousel-arrow-background', description: 'Arrow button background.' },
    { name: '--semiui-comp-carousel-arrow-background-hover', description: 'Arrow button background on hover (non-disabled).' },
    { name: '--semiui-comp-carousel-arrow-color', description: 'Arrow icon color.' },
    { name: '--semiui-comp-carousel-dot-gap', description: 'Spacing between dot indicators.' },
    { name: '--semiui-comp-carousel-dot-size', description: 'Diameter of each dot.' },
    { name: '--semiui-comp-carousel-dot-color', description: 'Inactive dot color.' },
    { name: '--semiui-comp-carousel-dot-color-active', description: 'Active dot color.' },
  ];
}

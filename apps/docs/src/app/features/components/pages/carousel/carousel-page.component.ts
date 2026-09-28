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

  protected readonly autoplayToggleCode = `<s-carousel [items]="slides" [autoplay]="true" [showAutoplayToggle]="true">...</s-carousel>`;

  protected readonly noLoopCode = `<s-carousel [items]="slides" [loop]="false" [showDots]="false">...</s-carousel>`;

  protected readonly itemsPerViewCode = `<s-carousel [items]="slides" [itemsPerView]="2">...</s-carousel>`;

  protected readonly arrowsOutsideCode = `<s-carousel [items]="slides" [arrowsOutside]="true">...</s-carousel>`;

  protected readonly centerModeCode = `<s-carousel [items]="slides" [centerMode]="true" [centerSlideWidth]="70" centerGap="-1.5rem">...</s-carousel>

// or make it the app-wide default from your preset:
definePreset(Semi, { defaults: { carousel: { centerMode: true } } });`;

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
      description: 'Automatically advances slides. Pauses while the carousel is hovered or has keyboard focus, for autoplayResumeDelay after any manual navigation, and never runs under prefers-reduced-motion: reduce.',
    },
    {
      name: 'autoplayInterval',
      type: 'number',
      default: '4000',
      description: 'Milliseconds between automatic slide advances.',
    },
    {
      name: 'autoplayResumeDelay',
      type: 'number',
      default: '10000',
      description: 'Milliseconds autoplay stays paused after a manual navigation (arrows, dots, keyboard, swipe) before it starts again. 0 turns the pause off, so autoplay ignores manual navigation.',
    },
    {
      name: 'showAutoplayToggle',
      type: 'boolean',
      default: 'false',
      description: 'Shows a pause/play button in the top corner while autoplay is on. Unlike the timed pauses, it stops autoplay until pressed again. Reuses the arrow tokens; icons.carouselPause / carouselPlay replace its built-in glyphs.',
    },
    {
      name: 'pauseLabel / playLabel',
      type: 'string',
      default: "'Pause autoplay' / 'Start autoplay'",
      description: 'Accessible names of the autoplay button in each state. Override them to localize.',
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
      description: 'Renders the arrow buttons as flex siblings flanking the viewport instead of floating on top of the slides. Ignored by centerMode.',
    },
    {
      name: 'centerMode',
      type: 'boolean',
      default: 'false',
      description: 'Centers the active slide at full size with its neighbours peeking in on either side, scaled down, blurred and faded. Clicking a neighbour activates it. Always shows one active slide (itemsPerView is ignored) and floats the arrows over the slides. Works in RTL and with drag.',
    },
    {
      name: 'centerSlideWidth',
      type: 'number',
      default: '75',
      description: 'centerMode only: the width of each slide, as a percentage of the viewport.',
    },
    {
      name: 'centerGap',
      type: 'string (CSS length)',
      default: "'0.75rem'",
      description: 'centerMode only: space between slides. Negative values tuck the neighbours under the active slide.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'activeIndexChange',
      type: 'EventEmitter<number>',
      description: 'Emitted whenever activeIndex changes -- the write side of the [(activeIndex)] two-way binding.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-center', description: 'On .s-carousel when centerMode is on.' },
    { name: 'data-state', description: "On .s-carousel__slide in centerMode: 'active', 'adjacent' (the peeking neighbours) or 'far' (hidden)." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-carousel', description: 'The focusable root region, carrying keyboard/pointer handlers.' },
    { name: '.s-carousel__viewport', description: 'The clipping window; touch-action: pan-y so vertical page scroll still works.' },
    { name: '.s-carousel__track', description: 'The flex row of slides, translated via transform to reveal activeIndex.' },
    { name: '.s-carousel__track--dragging', description: 'Applied while a pointer drag is in progress -- disables the transform transition for 1:1 tracking.' },
    { name: '.s-carousel__slide', description: 'Each slide wrapper; width is 100% / itemsPerView.' },
    { name: '.s-carousel__arrow', description: 'Previous/next button, floating over the slides by default.' },
    { name: '.s-carousel__arrow--outside', description: 'Applied when arrowsOutside is set -- lays the arrow out as a static flex sibling instead.' },
    { name: '.s-carousel__autoplay-toggle', description: 'The optional pause/play button, laid over the top corner with the arrows\' look.' },
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
    { name: '--semiui-comp-carousel-dot-active-width', description: 'Width of the active dot. Equals the dot size by default (a circle); wider makes it a pill.' },
    { name: '--semiui-comp-carousel-dot-active-scale', description: 'Scale of the active dot, a plain number. Set 1 when the active width already tells it apart.' },
    { name: '--semiui-comp-carousel-arrow-offset', description: 'Inset of the floating arrows from the carousel edge.' },
    { name: '--semiui-comp-carousel-arrow-icon-rotation-{prev,next}', description: 'Angle that turns the stock down-chevron to point left/right. Ignored when icons.carouselPrev / carouselNext supply purpose-drawn arrows.' },
    { name: '--semiui-comp-carousel-center-inactive-scale', description: 'centerMode: scale of the neighbouring slides, a plain number.' },
    { name: '--semiui-comp-carousel-center-inactive-blur', description: 'centerMode: blur of the neighbouring slides.' },
    { name: '--semiui-comp-carousel-center-inactive-opacity', description: 'centerMode: opacity of the neighbouring slides.' },
    { name: '--semiui-comp-carousel-slide-transition', description: 'Duration and easing of slide movement and of the centerMode scale/blur/opacity change, e.g. 0.3s ease. Removed under prefers-reduced-motion.' },
    { name: '--semiui-comp-carousel-arrow-background-disabled', description: 'Arrow button background when there is nothing further to scroll to.' },
    { name: '--semiui-comp-carousel-arrow-color-disabled', description: 'Arrow icon color in that same state.' },
    { name: '--semiui-comp-carousel-arrow-opacity-disabled', description: 'Opacity of a disabled arrow. Follows var(--semiui-opacity-disabled); set it to 100% to express disabled with the two colors above instead.' },
  ];
}

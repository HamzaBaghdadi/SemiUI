import { Component } from '@angular/core';
import { CarouselComponent } from '../../carousel/carousel.component';

interface Slide {
  color: string;
  label: string;
}

@Component({
  selector: 'app-carousel-docs-page',
  imports: [CarouselComponent],
  templateUrl: './carousel-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class CarouselDocsPage {
  protected slides: Slide[] = [
    { color: '#ef4444', label: 'Slide 1' },
    { color: '#f59e0b', label: 'Slide 2' },
    { color: '#22c55e', label: 'Slide 3' },
    { color: '#3b82f6', label: 'Slide 4' },
  ];
}

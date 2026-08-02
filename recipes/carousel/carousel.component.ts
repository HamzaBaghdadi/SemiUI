import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ZIconComponent } from '@zaytoon/primitives/icon';
import { injectZaytoonIcons } from '@zaytoon/theme';

/**
 * A single-slide-at-a-time carousel: pass `items` and render each slide through the required
 * `#slide` template slot, same convention as Tabs'/Accordion's `#content`. Supports autoplay
 * (paused on hover), looping, arrow keys, and pointer-drag/swipe.
 */
@Component({
  selector: 'z-carousel',
  imports: [ZIconComponent, NgTemplateOutlet],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent<TItem = unknown> {
  protected readonly icons = injectZaytoonIcons();

  items = input<readonly TItem[]>([]);
  /** The visible slide's index. Two-way bindable. */
  activeIndex = model(0);
  /** Wraps from the last slide back to the first (and vice versa) instead of stopping at the ends. */
  loop = input(true, { transform: booleanAttribute });
  autoplay = input(false, { transform: booleanAttribute });
  /** Milliseconds between automatic slide advances. */
  autoplayInterval = input(4000);
  showArrows = input(true, { transform: booleanAttribute });
  showDots = input(true, { transform: booleanAttribute });

  /** Each slide's content. Context: the item and its index. */
  protected slideTemplate = contentChild.required<unknown, TemplateRef<{ $implicit: TItem; index: number }>>(
    'slide',
    { read: TemplateRef },
  );

  protected readonly isPaused = signal(false);
  protected readonly isDragging = signal(false);
  private readonly dragDeltaX = signal(0);
  private dragStartX = 0;
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly trackTransform = computed(() => {
    const offset = this.activeIndex() * -100;
    const dragOffset = this.isDragging() ? this.dragDeltaX() : 0;
    return `translateX(calc(${offset}% + ${dragOffset}px))`;
  });

  constructor() {
    effect(() => {
      this.clearAutoplayTimer();
      if (this.autoplay() && !this.isPaused() && this.items().length > 1) {
        const interval = this.autoplayInterval();
        this.autoplayTimer = setInterval(() => this.next(), interval);
      }
    });
    inject(DestroyRef).onDestroy(() => this.clearAutoplayTimer());
  }

  protected next(): void {
    const count = this.items().length;
    if (count === 0) {
      return;
    }
    const nextIndex = this.activeIndex() + 1;
    if (nextIndex >= count) {
      if (this.loop()) {
        this.activeIndex.set(0);
      }
    } else {
      this.activeIndex.set(nextIndex);
    }
  }

  protected previous(): void {
    const count = this.items().length;
    if (count === 0) {
      return;
    }
    const prevIndex = this.activeIndex() - 1;
    if (prevIndex < 0) {
      if (this.loop()) {
        this.activeIndex.set(count - 1);
      }
    } else {
      this.activeIndex.set(prevIndex);
    }
  }

  protected goTo(index: number): void {
    this.activeIndex.set(index);
  }

  protected onMouseEnter(): void {
    this.isPaused.set(true);
  }

  protected onMouseLeave(): void {
    this.isPaused.set(false);
  }

  protected onPointerDown(event: PointerEvent): void {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.isDragging.set(true);
    this.dragStartX = event.clientX;
    this.dragDeltaX.set(0);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }
    this.dragDeltaX.set(event.clientX - this.dragStartX);
  }

  protected onPointerUp(): void {
    if (!this.isDragging()) {
      return;
    }
    this.isDragging.set(false);
    const delta = this.dragDeltaX();
    const threshold = 50;
    if (delta > threshold) {
      this.previous();
    } else if (delta < -threshold) {
      this.next();
    }
    this.dragDeltaX.set(0);
  }

  private clearAutoplayTimer(): void {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}

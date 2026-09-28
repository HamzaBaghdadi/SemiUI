import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  signal,
  viewChildren,
} from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { injectComponentDefaults, injectSemiUIIcons } from '@semiui/theme';

/** Built-in glyphs for the autoplay button, used when the preset supplies no `carouselPause` / `carouselPlay`. */
const PAUSE_ICON = {
  type: 'svg',
  markup:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
} as const;
const PLAY_ICON = {
  type: 'svg',
  markup:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
} as const;

/** Horizontal travel, in px, before a press turns into a drag (and stops being a plain click). */
const DRAG_THRESHOLD_PX = 5;
/** Horizontal travel, in px, at which a finished drag changes slide. */
const SWIPE_THRESHOLD_PX = 50;

/**
 * A carousel: pass `items` and render each slide through the required `#slide` template slot,
 * same convention as Tabs'/Accordion's `#content`. Supports autoplay, looping, arrow keys, and
 * pointer-drag/swipe.
 *
 * Autoplay is deliberately easy to stop (WCAG 2.2.2): it pauses while the pointer is over the
 * carousel, while keyboard focus is inside it, and for `autoplayResumeDelay` ms after any manual
 * navigation -- and it doesn't run at all under `prefers-reduced-motion: reduce`.
 *
 * `centerMode` shows one slide centered at full size with its neighbours peeking in on either
 * side, scaled down, blurred and faded. Every input here can also be defaulted app-wide from the
 * preset -- see `defaults.carousel` in `ComponentDefaults`.
 */
@Component({
  selector: 's-carousel',
  imports: [SIconComponent, NgTemplateOutlet],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent<TItem = unknown> {
  protected readonly icons = injectSemiUIIcons();
  private readonly defaults = injectComponentDefaults('carousel');
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly slideElements = viewChildren<ElementRef<HTMLElement>>('slideElement');

  /** A dedicated arrow glyph is drawn pointing the right way already; only the generic chevron needs turning. */
  protected readonly prevIcon = this.icons.carouselPrev ?? this.icons.chevronDown;
  protected readonly nextIcon = this.icons.carouselNext ?? this.icons.chevronDown;
  protected readonly prevIconIsChevron = !this.icons.carouselPrev;
  protected readonly nextIconIsChevron = !this.icons.carouselNext;

  items = input<readonly TItem[]>([]);
  /** The visible slide's index. Two-way bindable. */
  activeIndex = model(0);
  /** Wraps from the last slide back to the first (and vice versa) instead of stopping at the ends. */
  loop = input(this.defaults.loop ?? true, { transform: booleanAttribute });
  autoplay = input(this.defaults.autoplay ?? false, { transform: booleanAttribute });
  /** Milliseconds between automatic slide advances. */
  autoplayInterval = input(this.defaults.autoplayInterval ?? 4000);
  /**
   * Milliseconds autoplay stays paused after a manual navigation (arrows, dots, keyboard, swipe),
   * before it starts again. `0` turns that pause off, so autoplay ignores manual navigation.
   */
  autoplayResumeDelay = input(this.defaults.autoplayResumeDelay ?? 10000);
  showArrows = input(this.defaults.showArrows ?? true, { transform: booleanAttribute });
  showDots = input(this.defaults.showDots ?? true, { transform: booleanAttribute });
  /** How many slides are visible at once. `next()`/`previous()` still move the window by one slide. Ignored by `centerMode`, which always shows one active slide. */
  itemsPerView = input(this.defaults.itemsPerView ?? 1);
  /** Renders the arrow buttons flanking the viewport instead of floating on top of the slides. Ignored by `centerMode`, whose arrows always float over the peeking neighbours. */
  arrowsOutside = input(this.defaults.arrowsOutside ?? false, { transform: booleanAttribute });
  /** Centers the active slide with its neighbours peeking in on either side. Clicking a neighbour activates it. */
  centerMode = input(this.defaults.centerMode ?? false, { transform: booleanAttribute });
  /** `centerMode` only: each slide's width, as a percentage of the viewport. */
  centerSlideWidth = input(this.defaults.centerSlideWidth ?? 75);
  /** `centerMode` only: space between slides, any CSS length. Negative tucks the neighbours under the active slide. */
  centerGap = input(this.defaults.centerGap ?? '0.75rem');

  /** Shows a pause/play button while `autoplay` is on, so autoplay can be stopped outright and started again. */
  showAutoplayToggle = input(this.defaults.showAutoplayToggle ?? false, { transform: booleanAttribute });
  /** Accessible name of the autoplay button while autoplay is running. Override it to localize. */
  pauseLabel = input('Pause autoplay');
  /** Accessible name of the autoplay button while autoplay is stopped. Override it to localize. */
  playLabel = input('Start autoplay');

  protected readonly pauseIcon = this.icons.carouselPause ?? PAUSE_ICON;
  protected readonly playIcon = this.icons.carouselPlay ?? PLAY_ICON;

  /** Each slide's content. Context: the item and its index. */
  protected slideTemplate = contentChild.required<unknown, TemplateRef<{ $implicit: TItem; index: number }>>(
    'slide',
    { read: TemplateRef },
  );

  protected readonly isDragging = signal(false);
  private readonly dragDeltaX = signal(0);
  private dragStartX = 0;
  /** A press is down on the viewport; it only becomes a drag once it travels past the threshold. */
  private isPressed = false;
  private didDrag = false;
  private pointerCaptured = false;

  private readonly isHovered = signal(false);
  private readonly hasKeyboardFocus = signal(false);
  private readonly pausedByInteraction = signal(false);
  /** Set by the autoplay button: unlike the timed pauses, it holds until the button is pressed again. */
  protected readonly stoppedByUser = signal(false);
  private readonly prefersReducedMotion = signal(false);
  private resumeTimer: ReturnType<typeof setTimeout> | null = null;

  /** How many slides are actually visible at once: `centerMode` always has exactly one active slide. */
  protected readonly perView = computed(() => (this.centerMode() ? 1 : this.itemsPerView()));
  /** Arrows flank the viewport only when asked to, and never in `centerMode`. */
  protected readonly outsideArrows = computed(() => this.arrowsOutside() && !this.centerMode());

  /** The furthest the leading (leftmost visible) slide index can advance to, so the trailing edge never scrolls past the last item. */
  protected readonly maxIndex = computed(() => Math.max(0, this.items().length - this.perView()));
  /** One dot per reachable leading-slide position (0..maxIndex), not one per item -- with itemsPerView > 1 those aren't the same count. */
  protected readonly dotPositions = computed(() => Array.from({ length: this.maxIndex() + 1 }, (_, i) => i));

  protected readonly trackTransform = computed(() => {
    // Flex already mirrors the slides themselves under RTL (slide 0 renders at the physical
    // right, not the left), so revealing a higher index means shifting the track the *other*
    // physical way -- this sign flip is what keeps that consistent with the drag math below,
    // which reads raw (unflipped) pointer movement.
    const sign = this.isRtl() ? 1 : -1;
    const dragOffset = this.isDragging() ? this.dragDeltaX() : 0;
    if (this.centerMode()) {
      // Slide N starts N * (slide width + gap) along the track. Shifting the track by that puts
      // the slide flush with the leading edge; pulling back half the leftover room centers it.
      const width = this.centerSlideWidth();
      const travel = `${this.activeIndex()} * (${width}% + ${this.centerGap()}) - (100% - ${width}%) / 2`;
      return `translateX(calc(${sign} * (${travel}) + ${dragOffset}px))`;
    }
    const offset = (sign * this.activeIndex() * 100) / this.perView();
    return `translateX(calc(${offset}% + ${dragOffset}px))`;
  });

  private isRtl(): boolean {
    return this.elementRef.nativeElement.matches(':dir(rtl)');
  }

  /**
   * `afterRenderEffect` never runs on the server, so the interval below (and the `window` access
   * in `watchReducedMotion`) stays out of SSR. It re-runs -- clearing the old interval -- whenever
   * anything that pauses autoplay changes.
   */
  private readonly autoplayEffect = afterRenderEffect((onCleanup) => {
    const shouldRun =
      this.autoplay() &&
      this.items().length > 1 &&
      !this.isHovered() &&
      !this.hasKeyboardFocus() &&
      !this.pausedByInteraction() &&
      !this.stoppedByUser() &&
      !this.prefersReducedMotion();
    if (!shouldRun) {
      return;
    }
    const timer = setInterval(() => this.next(), this.autoplayInterval());
    onCleanup(() => clearInterval(timer));
  });

  constructor() {
    afterNextRender(() => this.watchReducedMotion());
    this.destroyRef.onDestroy(() => this.clearResumeTimer());
  }

  private watchReducedMotion(): void {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion.set(query.matches);
    const onChange = (event: MediaQueryListEvent) => this.prefersReducedMotion.set(event.matches);
    query.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
  }

  protected next(): void {
    if (this.items().length === 0) {
      return;
    }
    const nextIndex = this.activeIndex() + 1;
    if (nextIndex > this.maxIndex()) {
      if (this.loop()) {
        this.activeIndex.set(0);
      }
    } else {
      this.activeIndex.set(nextIndex);
    }
  }

  protected previous(): void {
    if (this.items().length === 0) {
      return;
    }
    const prevIndex = this.activeIndex() - 1;
    if (prevIndex < 0) {
      if (this.loop()) {
        this.activeIndex.set(this.maxIndex());
      }
    } else {
      this.activeIndex.set(prevIndex);
    }
  }

  protected goTo(index: number): void {
    this.activeIndex.set(index);
  }

  // Manual navigation: the same moves as above, but the person driving the carousel also gets
  // autoplay out of their way. Autoplay itself calls next() directly and must not pause itself.
  protected userNext(): void {
    this.pauseForInteraction();
    this.next();
  }

  protected userPrevious(): void {
    this.pauseForInteraction();
    this.previous();
  }

  protected userGoTo(index: number): void {
    this.pauseForInteraction();
    this.goTo(index);
  }

  protected toggleAutoplay(): void {
    this.stoppedByUser.update((stopped) => !stopped);
  }

  private pauseForInteraction(): void {
    const delay = this.autoplayResumeDelay();
    if (delay <= 0 || !this.autoplay()) {
      return;
    }
    this.clearResumeTimer();
    this.pausedByInteraction.set(true);
    this.resumeTimer = setTimeout(() => {
      this.resumeTimer = null;
      this.pausedByInteraction.set(false);
    }, delay);
  }

  private clearResumeTimer(): void {
    if (this.resumeTimer !== null) {
      clearTimeout(this.resumeTimer);
      this.resumeTimer = null;
    }
  }

  /**
   * In `centerMode`, `active` is the centered slide, `adjacent` the two peeking beside it, and
   * `far` everything else (hidden). Outside it the slide states don't apply.
   */
  protected slideState(index: number): 'active' | 'adjacent' | 'far' {
    const distance = Math.abs(index - this.activeIndex());
    return distance === 0 ? 'active' : distance === 1 ? 'adjacent' : 'far';
  }

  /** Whether the slide is out of the visible window, and so out of the accessibility tree and the tab order. */
  protected isSlideHidden(index: number): boolean {
    const start = this.activeIndex();
    return index < start || index >= start + this.perView();
  }

  /** ArrowLeft/ArrowRight follow the physical direction their name implies, so which slide that
   * means (previous or next) flips under RTL along with everything else above. */
  protected onArrowLeft(): void {
    if (this.isRtl()) {
      this.userNext();
    } else {
      this.userPrevious();
    }
  }

  protected onArrowRight(): void {
    if (this.isRtl()) {
      this.userPrevious();
    } else {
      this.userNext();
    }
  }

  protected onMouseEnter(): void {
    this.isHovered.set(true);
  }

  protected onMouseLeave(): void {
    this.isHovered.set(false);
  }

  /** Only keyboard focus pauses autoplay: a mouse click leaves focus on the arrow it hit, and that would freeze the carousel until the next click elsewhere. */
  protected onFocusIn(event: FocusEvent): void {
    if ((event.target as HTMLElement).matches(':focus-visible')) {
      this.hasKeyboardFocus.set(true);
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.elementRef.nativeElement.contains(next)) {
      this.hasKeyboardFocus.set(false);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    // Primary button only: a right or middle click on a mouse isn't a swipe.
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    this.isPressed = true;
    this.didDrag = false;
    this.pointerCaptured = false;
    this.dragStartX = event.clientX;
    this.dragDeltaX.set(0);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isPressed) {
      return;
    }
    const delta = event.clientX - this.dragStartX;
    if (!this.didDrag && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      this.didDrag = true;
      this.isDragging.set(true);
    }
    if (!this.didDrag) {
      return;
    }
    // Captured on the viewport, and only now that it's a real drag: capturing at pointerdown would
    // redirect the follow-up click of a plain press away from a button or link inside the slide.
    if (!this.pointerCaptured) {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      this.pointerCaptured = true;
    }
    this.dragDeltaX.set(delta);
  }

  protected onPointerUp(): void {
    if (!this.isPressed) {
      return;
    }
    this.isPressed = false;
    this.pointerCaptured = false;
    if (!this.isDragging()) {
      return;
    }
    this.isDragging.set(false);
    const delta = this.dragDeltaX();
    // Raw drag delta stays physical (a left drag always visually moves the track left, same as
    // any scroll gesture), but which slide that now previews flips under RTL along with
    // trackTransform's sign above -- dragging left reveals the *previous* slide there, not next.
    const isRtl = this.isRtl();
    if (delta > SWIPE_THRESHOLD_PX) {
      if (isRtl) {
        this.userNext();
      } else {
        this.userPrevious();
      }
    } else if (delta < -SWIPE_THRESHOLD_PX) {
      if (isRtl) {
        this.userPrevious();
      } else {
        this.userNext();
      }
    }
    this.dragDeltaX.set(0);
  }

  /**
   * Click-to-activate for the peeking neighbours in `centerMode`. Those slides are `inert` (so
   * nothing focusable inside them stays reachable) and inert elements don't receive pointer events,
   * which means the click lands on the viewport instead -- so the slide under the pointer is worked
   * out here from its on-screen rect. A click that ends a drag is a swipe, not a selection.
   */
  protected onViewportClick(event: MouseEvent): void {
    if (!this.centerMode() || this.didDrag) {
      return;
    }
    const slides = this.slideElements();
    const active = this.activeIndex();
    const contains = (index: number) => {
      const rect = slides[index]?.nativeElement.getBoundingClientRect();
      return (
        !!rect &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    };
    // The active slide wins where a tucked-in neighbour overlaps it.
    if (contains(active)) {
      return;
    }
    const target = [active - 1, active + 1].find(contains);
    if (target !== undefined) {
      this.userGoTo(target);
    }
  }
}

import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  viewChild,
} from '@angular/core';

export type MarqueeDirection = 'left' | 'right' | 'up' | 'down';

/**
 * A continuously scrolling content loop: wrap anything in `<s-marquee>` and it repeats
 * seamlessly. The scroll itself is pure CSS -- the track holds two identical copies of the content
 * and animates -50% along the scroll axis, so the moment the first copy scrolls out the second is
 * exactly where it started.
 *
 * The second copy is cloned from the first in JS rather than written as a second `<ng-content />`:
 * Angular projects a given piece of content into exactly one slot, so two `<ng-content />` tags
 * don't duplicate anything -- one of them just renders empty, which leaves a visible gap for half
 * of every loop. A MutationObserver keeps the clone in sync so dynamic content (an `@for` over a
 * signal, say) doesn't leave the second copy stale.
 *
 * `up`/`down` need a bounded height set on the host by the consumer (e.g. `style="height: 8rem"`),
 * the same convention Splitter's vertical orientation uses, since the component itself has no
 * natural height to constrain to.
 */
@Component({
  selector: 's-marquee',
  templateUrl: './marquee.component.html',
  styleUrl: './marquee.component.css',
  host: {
    class: 's-marquee',
    '[attr.data-direction]': 'direction()',
    '[attr.data-pause-on-hover]': 'pauseOnHover() ? \'\' : null',
    '[style.--s-marquee-duration]': 'duration() + "s"',
  },
})
export class MarqueeComponent {
  private readonly primary = viewChild<ElementRef<HTMLDivElement>>('primary');
  private readonly clone = viewChild<ElementRef<HTMLDivElement>>('clone');
  private readonly destroyRef = inject(DestroyRef);

  direction = input<MarqueeDirection>('left');
  /** Seconds for one full loop -- lower is faster. */
  duration = input(15);
  pauseOnHover = input(true, { transform: booleanAttribute });

  constructor() {
    afterNextRender(() => {
      const source = this.primary()?.nativeElement;
      const target = this.clone()?.nativeElement;
      if (!source || !target) {
        return;
      }
      const sync = () => target.replaceChildren(...Array.from(source.childNodes, (node) => node.cloneNode(true)));
      sync();
      // Only `source` is observed, never `target` -- so the clone writes above can't retrigger this.
      const observer = new MutationObserver(sync);
      observer.observe(source, { childList: true, subtree: true, characterData: true, attributes: true });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

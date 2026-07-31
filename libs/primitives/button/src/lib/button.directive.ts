import { Directive, HostListener, input, output } from '@angular/core';

/** Behavior-only primitive: disabled state, click/keyboard press handling. No visual styling. */
@Directive({
  selector: '[zButton]',
  host: {
    role: 'button',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
})
export class ButtonDirective {
  disabled = input(false);
  pressed = output<void>();

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.pressed.emit();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }
    event.preventDefault();
    this.pressed.emit();
  }
}

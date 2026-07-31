import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonDirective } from './button.directive';

@Component({
  imports: [ButtonDirective],
  template: `<button zButton [disabled]="disabled" (pressed)="onPressed()">Click</button>`,
})
class HostComponent {
  disabled = false;
  pressCount = 0;

  onPressed(): void {
    this.pressCount++;
  }
}

function createFixture(disabled: boolean): { fixture: ComponentFixture<HostComponent>; button: HTMLButtonElement } {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.disabled = disabled;
  fixture.detectChanges();
  const button = fixture.nativeElement.querySelector('button');
  return { fixture, button };
}

describe('ButtonDirective', () => {
  it('emits pressed on click when enabled', () => {
    const { fixture, button } = createFixture(false);

    button.click();

    expect(fixture.componentInstance.pressCount).toBe(1);
  });

  it('blocks click when disabled', () => {
    const { fixture, button } = createFixture(true);

    button.click();

    expect(fixture.componentInstance.pressCount).toBe(0);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('tabindex')).toBe('-1');
  });

  it('emits pressed on Enter and Space keydown', () => {
    const { fixture, button } = createFixture(false);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    expect(fixture.componentInstance.pressCount).toBe(2);
  });

  it('ignores keydown when disabled', () => {
    const { fixture, button } = createFixture(true);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(fixture.componentInstance.pressCount).toBe(0);
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InputDirective } from './input.directive';

@Component({
  imports: [InputDirective],
  template: `<input sInput [disabled]="disabled" [invalid]="invalid" [readonly]="readOnly" />`,
})
class HostComponent {
  disabled = false;
  invalid = false;
  readOnly = false;
}

function render(state: Partial<HostComponent>) {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  Object.assign(fixture.componentInstance, state);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

describe('InputDirective', () => {
  it('leaves the native input enabled and valid by default', () => {
    const input = render({});

    expect(input.disabled).toBe(false);
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.hasAttribute('readonly')).toBe(false);
  });

  it('sets the native disabled property when disabled', () => {
    const input = render({ disabled: true });

    expect(input.disabled).toBe(true);
  });

  it('sets aria-invalid when invalid', () => {
    const input = render({ invalid: true });

    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets the readonly attribute when readOnly', () => {
    const input = render({ readOnly: true });

    expect(input.hasAttribute('readonly')).toBe(true);
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgIcon } from '@ng-icons/core';
import { provideFluentIcons } from './provide-fluent-icons';

@Component({
  imports: [NgIcon],
  template: `<ng-icon name="lucideLoaderCircle" />`,
})
class HostComponent {}

describe('provideFluentIcons', () => {
  it('registers lucideLoaderCircle so <ng-icon name="lucideLoaderCircle"> renders without error', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideFluentIcons()],
    });

    expect(() => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
    }).not.toThrow();
  });
});

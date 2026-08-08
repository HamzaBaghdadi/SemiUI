import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgIcon } from '@ng-icons/core';
import { provideCupertinoIcons } from './provide-cupertino-icons';

@Component({
  imports: [NgIcon],
  template: `<ng-icon name="lucideLoaderCircle" />`,
})
class HostComponent {}

describe('provideCupertinoIcons', () => {
  it('registers lucideLoaderCircle so <ng-icon name="lucideLoaderCircle"> renders without error', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideCupertinoIcons()],
    });

    expect(() => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
    }).not.toThrow();
  });
});

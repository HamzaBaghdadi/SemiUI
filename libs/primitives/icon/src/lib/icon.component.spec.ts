import { TestBed } from '@angular/core/testing';
import { NgIcon } from '@ng-icons/core';
import { IconRef } from '@semiui/tokens';
import { SIconComponent } from './icon.component';

describe('SIconComponent', () => {
  it('forwards an ng-icon ref to the "name" input', () => {
    TestBed.configureTestingModule({ imports: [SIconComponent] });
    const fixture = TestBed.createComponent(SIconComponent);
    fixture.componentRef.setInput('ref', { type: 'ng-icon', name: 'lucideLoaderCircle' } satisfies IconRef);
    fixture.detectChanges();

    const ngIcon = fixture.debugElement.query((node) => node.componentInstance instanceof NgIcon);
    expect(ngIcon.componentInstance.name()).toBe('lucideLoaderCircle');
  });

  it('forwards an svg ref to the "svg" input', () => {
    TestBed.configureTestingModule({ imports: [SIconComponent] });
    const fixture = TestBed.createComponent(SIconComponent);
    fixture.componentRef.setInput('ref', { type: 'svg', markup: '<svg></svg>' } satisfies IconRef);
    fixture.detectChanges();

    const ngIcon = fixture.debugElement.query((node) => node.componentInstance instanceof NgIcon);
    expect(ngIcon.componentInstance.svg()).toBe('<svg></svg>');
  });
});

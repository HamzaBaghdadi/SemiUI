import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseFormFieldControl } from './base-form-field-control';

@Component({
  selector: 'z-test-field',
  template: `<input [value]="value()" (input)="value.set($any($event.target).value)" (blur)="handleBlur()" />`,
})
class TestFieldComponent extends BaseFormFieldControl<string> {
  protected override emptyValue(): string {
    return '';
  }
}

describe('BaseFormFieldControl', () => {
  describe('standalone / Signal Forms shape', () => {
    let fixture: ComponentFixture<TestFieldComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [TestFieldComponent] });
      fixture = TestBed.createComponent(TestFieldComponent);
      fixture.detectChanges();
    });

    it('exposes value as a writable model signal defaulting to emptyValue()', () => {
      expect(fixture.componentInstance.value()).toBe('');
    });

    it('emits touch when handleBlur runs', () => {
      const touched = vi.fn();
      fixture.componentInstance.touch.subscribe(touched);

      fixture.nativeElement.querySelector('input').dispatchEvent(new Event('blur'));

      expect(touched).toHaveBeenCalledOnce();
    });
  });

  describe('ngModel integration', () => {
    @Component({
      imports: [TestFieldComponent, FormsModule],
      template: `<z-test-field [(ngModel)]="name" />`,
    })
    class NgModelHost {
      name = 'initial';
    }

    it('writes the model value into the control and reflects control edits back to the model', async () => {
      TestBed.configureTestingModule({ imports: [NgModelHost] });
      const fixture = TestBed.createComponent(NgModelHost);
      fixture.detectChanges();
      await fixture.whenStable();
      TestBed.tick(); // flush the effect() run guarding the initial writeValue() push

      const field = fixture.debugElement.query((n) => n.componentInstance instanceof TestFieldComponent)
        .componentInstance as TestFieldComponent;
      expect(field.value()).toBe('initial');

      field.value.set('typed');
      fixture.detectChanges();
      await fixture.whenStable();
      TestBed.tick();

      expect(fixture.componentInstance.name).toBe('typed');
    });
  });

  describe('reactive forms integration', () => {
    @Component({
      imports: [TestFieldComponent, ReactiveFormsModule],
      template: `<z-test-field [formControl]="control" />`,
    })
    class ReactiveHost {
      control = new FormControl('reactive-initial', { nonNullable: true });
    }

    it('applies disabled/invalid from the FormControl to the field', () => {
      TestBed.configureTestingModule({ imports: [ReactiveHost] });
      const fixture = TestBed.createComponent(ReactiveHost);
      fixture.componentInstance.control.disable();
      fixture.detectChanges();

      const field = fixture.debugElement.query((n) => n.componentInstance instanceof TestFieldComponent)
        .componentInstance as TestFieldComponent;

      expect(field.value()).toBe('reactive-initial');
      expect(field['effectiveDisabled']()).toBe(true);
    });
  });
});

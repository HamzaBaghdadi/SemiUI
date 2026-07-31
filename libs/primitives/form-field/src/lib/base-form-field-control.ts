import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  afterNextRender,
  Directive,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

function noop(): void {
  /* no-op default until registerOnChange/registerOnTouched supply a real callback */
}

/**
 * Shared plumbing for a custom form control that needs to work correctly with all three Angular
 * form APIs at once:
 *  - ngModel / reactive forms, via the classic `ControlValueAccessor` contract
 *  - Signal Forms, via the `FormValueControl<T>` contract (`value: ModelSignal<T>`, `disabled`,
 *    `invalid`, `touch`) -- see @angular/forms/signals
 *  - plain standalone usage, via two-way `[(value)]` binding on the same `value` model signal
 *
 * Concrete subclasses only need to implement `emptyValue()`. Do *not* also register
 * `NG_VALUE_ACCESSOR` via `providers` -- self-injecting `NgControl` (below) and registering as
 * its value accessor is the alternative to that, and combining both creates a circular DI
 * dependency (NG0200): the value-accessor lookup needs this component, which needs `NgControl`,
 * which needs the value-accessor lookup to resolve first.
 */
@Directive()
export abstract class BaseFormFieldControl<T> implements ControlValueAccessor {
  protected readonly ngControl = inject(NgControl, { optional: true, self: true });

  private isWriting = false;
  private onChangeCb: (value: T) => void = noop;
  protected onTouchedCb: () => void = noop;
  private readonly cvaDisabled = signal(false);

  /** FormValueControl contract: kept in sync with the bound Signal Forms field, if any. */
  value = model<T>(this.emptyValue());
  /** FormUiControl contract: bound from Signal Forms; also settable directly for standalone use. */
  disabled = input(false);
  invalid = input(false);
  /** FormUiControl contract: emit on blur so Signal Forms marks the field touched. */
  touch = output<void>();

  protected readonly effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());

  // Bumped on every reactive-forms status change, purely to give `effectiveInvalid` a signal
  // dependency to react to -- the actual invalid/touched/dirty values are re-read fresh from
  // `ngControl.control` on every recompute, this is never read for its own value.
  private readonly statusVersion = signal(0);

  protected readonly effectiveInvalid = computed(() => {
    this.statusVersion();
    const control = this.ngControl?.control;
    const cvaInvalid = !!control && control.invalid && (control.touched || control.dirty);
    return this.invalid() || cvaInvalid;
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    effect(() => {
      const value = this.value();
      // `isWriting` is cleared *here*, not synchronously at the end of writeValue(), because
      // effects run asynchronously: by the time this callback fires, writeValue() has already
      // returned and reset the flag. Clearing it inside the effect instead means the flag survives
      // until the run it was meant to guard actually happens, so the initial CVA-pushed value
      // doesn't get echoed back through onChange (which would incorrectly mark the control dirty
      // before the user has touched anything).
      if (this.isWriting) {
        this.isWriting = false;
        return;
      }
      this.onChangeCb(value);
    });

    // `ngControl.statusChanges` isn't connected to the real control yet during construction (the
    // owning directive -- NgModel/FormControlName/etc -- wires that up in its own ngOnChanges,
    // which runs after every directive on this element has been constructed). Subscribing here
    // would silently capture a dead/disconnected observable, so defer until after the first
    // render, by which point the control is guaranteed to be connected.
    if (this.ngControl) {
      const destroyRef = inject(DestroyRef);
      afterNextRender(() => {
        this.ngControl?.statusChanges?.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
          this.statusVersion.update((v) => v + 1);
        });
      });
    }
  }

  /** The value to fall back to when the CVA is written a nullish value (e.g. `''` for text). */
  protected abstract emptyValue(): T;

  writeValue(value: T): void {
    this.isWriting = true;
    this.value.set(value ?? this.emptyValue());
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChangeCb = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCb = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected handleBlur(): void {
    this.onTouchedCb();
    this.touch.emit();
    this.statusVersion.update((v) => v + 1); // touched/dirty can change without a status emission
  }
}

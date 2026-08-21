import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  afterNextRender,
  Directive,
  DestroyRef,
  booleanAttribute,
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
  /** Set once the constructor's effect (below) has run for the first time. Angular runs a fresh
   * effect once unconditionally, regardless of whether any tracked signal actually changed -- so
   * the *first* `writeValue()` call is always safely consumed by that guaranteed run, even when
   * its value happens to equal `value`'s pre-existing initial one. Only writes arriving *after*
   * that first run needs the no-op short-circuit in `writeValue()` below. */
  private hasSyncedOnce = false;
  private onChangeCb: (value: T) => void = noop;
  protected onTouchedCb: () => void = noop;
  private readonly cvaDisabled = signal(false);

  /** FormValueControl contract: kept in sync with the bound Signal Forms field, if any. */
  value = model<T>(this.emptyValue());
  /** FormUiControl contract: bound from Signal Forms; also settable directly for standalone use. */
  disabled = input(false);
  invalid = input(false);
  /** Focuses the field once, after its first render. False by default -- opt in per field, don't
   * fight the browser's own scroll position or steal focus from wherever the user already is. */
  autoFocus = input(false, { transform: booleanAttribute });
  /** Sets `autocomplete="off"` on the field's native text-entry element, for fields the browser
   * shouldn't offer to autofill (declared here for a consistent name across every field, even
   * though only subclasses with a real native text input actually consume it). */
  disableAutocomplete = input(false, { transform: booleanAttribute });
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
      this.hasSyncedOnce = true;
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

    // Deferred to after the first render (same reasoning as the statusChanges subscription above)
    // so `focusTarget()` -- overridden per subclass -- sees its `viewChild` populated. Read here in
    // the constructor rather than a signal-tracking `effect`, since `autoFocus` is meant to focus
    // the field once on mount, not re-focus it every time the input's bound value happens to change.
    afterNextRender(() => {
      if (this.autoFocus()) {
        this.focusTarget()?.focus();
      }
    });
  }

  /** The value to fall back to when the CVA is written a nullish value (e.g. `''` for text). */
  protected abstract emptyValue(): T;

  /** The element `autoFocus` calls `.focus()` on. The base class has no template of its own, so
   * every subclass that wants `autoFocus` to work must override this to return its own native
   * focusable element (e.g. `this.inputRef()?.nativeElement ?? null`). Defaults to a no-op. */
  protected focusTarget(): HTMLElement | null {
    return null;
  }

  writeValue(value: T): void {
    const next = value ?? this.emptyValue();
    // Skipping a same-value write avoids leaving `isWriting` stuck (see hasSyncedOnce's doc) --
    // but only once the constructor's effect has already run at least once. Before that, the
    // effect's first run hasn't happened yet regardless of whether *this* write is a no-op against
    // `value`'s pre-existing initial value, so it must still arm the guard: that first run is
    // guaranteed to happen and is exactly what needs to see `isWriting === true` to avoid echoing
    // this initial CVA-pushed value back through onChange.
    if (this.hasSyncedOnce && Object.is(next, this.value())) {
      return;
    }
    this.isWriting = true;
    this.value.set(next);
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

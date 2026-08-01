import { Directive, input } from '@angular/core';

/** Behavior-only primitive: syncs disabled/invalid/readonly state onto a native `<input>` or `<textarea>`. */
@Directive({
  selector: 'input[zInput], textarea[zInput]',
  host: {
    '[disabled]': 'disabled()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
    '[attr.readonly]': 'readonly() ? "" : null',
  },
})
export class InputDirective {
  disabled = input(false);
  invalid = input(false);
  readonly = input(false);
}

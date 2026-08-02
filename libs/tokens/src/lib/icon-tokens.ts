import { IconRef } from './icon-ref';

/** Default icons a preset provides for built-in component states (e.g. a button's loading spinner). */
export interface IconTokens {
  loading: IconRef;
  /** Select's trigger icon, and any other component-level dropdown affordance. */
  chevronDown: IconRef;
  /** The clear/reset button shown by Select and other clearable inputs. */
  clear: IconRef;
  /** Password's "reveal" toggle icon, shown when the value is masked. */
  passwordShow: IconRef;
  /** Password's "hide" toggle icon, shown when the value is revealed. */
  passwordHide: IconRef;
  /** Checkbox's checkmark, shown when checked. */
  checkboxCheck: IconRef;
  /** Checkbox's indeterminate glyph (a dash), shown when the indeterminate input is set. */
  checkboxIndeterminate: IconRef;
  /** Shown inside Select/Multiselect's filter box. */
  search: IconRef;
  /** Generic increment glyph (Input Number's horizontal-layout increment button, etc). */
  plus: IconRef;
  /** Generic decrement glyph (Input Number's horizontal-layout decrement button, etc). */
  minus: IconRef;
  /** Avatar's fallback icon, shown when neither an image nor a name is available. */
  avatarFallback: IconRef;
  /** Rating's star -- filled/empty is a CSS fill toggle on this same icon, not two separate ones. */
  rating: IconRef;
}

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
}

import { IconRef } from './icon-ref';

/** Default icons a preset provides for built-in component states (e.g. a button's loading spinner). */
export interface IconTokens {
  loading: IconRef;
  /**
   * The generic vertical chevron. Select's trigger, Accordion's expand indicator and Carousel's
   * arrows all fall back to it (see the optional per-component keys below), rotated by that
   * component's own rotation token so a single glyph points the right way in each.
   */
  chevronDown: IconRef;
  /** Accordion's expand indicator. Falls back to `chevronDown`. */
  accordionChevron?: IconRef;
  /** Carousel's "previous slide" arrow. Falls back to `chevronDown`, rotated by `carousel.arrowIconRotationPrev`. */
  carouselPrev?: IconRef;
  /** Carousel's "next slide" arrow. Falls back to `chevronDown`, rotated by `carousel.arrowIconRotationNext`. */
  carouselNext?: IconRef;
  /** Select's trigger icon. Falls back to `chevronDown`. */
  selectChevron?: IconRef;
  /** Carousel's autoplay "pause" button. Falls back to a built-in glyph, so no icon needs registering. */
  carouselPause?: IconRef;
  /** Carousel's autoplay "play" button. Falls back to a built-in glyph, so no icon needs registering. */
  carouselPlay?: IconRef;
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
  /** File Upload's dropzone icon. */
  upload: IconRef;
  /** File Upload's generic per-file icon, shown for non-image files without a thumbnail preview. */
  file: IconRef;
  /** Toast's success-variant icon. */
  toastSuccess: IconRef;
  /** Toast's error-variant icon. */
  toastError: IconRef;
  /** Toast's warning-variant icon. */
  toastWarning: IconRef;
  /** Toast's info-variant icon. */
  toastInfo: IconRef;
}

import { inject, InjectionToken } from '@angular/core';
import { ComponentDefaults } from '@semiui/tokens';

export const SEMIUI_DEFAULTS = new InjectionToken<ComponentDefaults>('SEMIUI_DEFAULTS');

/**
 * Reads the active preset's input defaults for one component (see `ComponentDefaults`). Always
 * returns an object, so a component can write `defaults.centerMode ?? false` without checking
 * whether the preset -- or `provideSemiUI` itself -- supplied anything.
 *
 * Call it from a field initializer (an injection context), and feed the result to the input's
 * initial value. The input stays the source of truth: a binding on an instance overrides it.
 *
 * ```ts
 * private readonly defaults = injectComponentDefaults('carousel');
 * centerMode = input(this.defaults.centerMode ?? false, { transform: booleanAttribute });
 * ```
 */
export function injectComponentDefaults<K extends string & keyof ComponentDefaults>(
  component: K,
): NonNullable<ComponentDefaults[K]> {
  const defaults = inject(SEMIUI_DEFAULTS, { optional: true });
  return (defaults?.[component] ?? {}) as NonNullable<ComponentDefaults[K]>;
}

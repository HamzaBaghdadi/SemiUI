export const CSS_VAR_PREFIX = 'zaytoon';

function camelToKebab(segment: string): string {
  return segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Recursively flattens a nested token object into `--zaytoon-a-b-c` CSS custom properties. */
export function flattenTokensToCssVars(
  tokens: Record<string, unknown>,
  path: string[] = [],
): Record<string, string> {
  return Object.entries(tokens).reduce<Record<string, string>>((vars, [key, value]) => {
    const nextPath = [...path, camelToKebab(key)];
    if (typeof value === 'string') {
      vars[`--${CSS_VAR_PREFIX}-${nextPath.join('-')}`] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(vars, flattenTokensToCssVars(value as Record<string, unknown>, nextPath));
    }
    return vars;
  }, {});
}

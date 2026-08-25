/**
 * Token reference parsing and the errors the engine raises when a reference can't be satisfied.
 *
 * A reference is a `{path}` group inside a token's string value. A value may be nothing but a
 * reference (`'{primary}'`), or may embed one or more inside a larger CSS expression
 * (`'color-mix(in srgb, {primary} 15%, transparent)'`). Anything without `{...}` is a raw CSS
 * value and passes through untouched.
 */

/** Matches every `{path}` group in a value. Paths are dot-separated segments. */
const TOKEN_REF_PATTERN = /\{([^{}\s]+)\}/g;

/** True when the entire value is one reference and nothing else -- `'{blue.500}'`, not
 * `'1px solid {border}'`. Only these can resolve to a whole subtree (a full color scale). */
export function isWholeTokenRef(value: string): boolean {
  return /^\{[^{}\s]+\}$/.test(value);
}

/** The path inside a whole-value reference, or `null` if the value isn't one. */
export function wholeTokenRefPath(value: string): string | null {
  return isWholeTokenRef(value) ? value.slice(1, -1) : null;
}

/** Every reference path appearing in a value, in source order, with duplicates preserved. */
export function parseTokenRefs(value: string): string[] {
  const paths: string[] = [];
  for (const match of value.matchAll(TOKEN_REF_PATTERN)) {
    paths.push(match[1]);
  }
  return paths;
}

/** Rewrites every `{path}` group in `value` using `replace`. */
export function replaceTokenRefs(value: string, replace: (path: string) => string): string {
  return value.replace(TOKEN_REF_PATTERN, (_full, path: string) => replace(path));
}

/** Base class for every diagnostic the token engine raises, so callers can catch them as one. */
export class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    // Restores the prototype chain under ES5 downlevelling, so `instanceof` still works.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** `'{doesNotExist}'` -- the referenced path isn't defined anywhere in the preset. */
export class MissingTokenReferenceError extends TokenError {
  constructor(
    readonly reference: string,
    readonly ownerPath: string,
    readonly suggestions: string[] = [],
  ) {
    super(
      `Unknown token reference "{${reference}}" used by "${ownerPath}".` +
        (suggestions.length ? ` Did you mean ${suggestions.map((s) => `"{${s}}"`).join(', ')}?` : '') +
        ' References resolve against the preset\'s semantic tokens first, then its primitives,' +
        ' then component tokens under the "components." prefix.',
    );
  }
}

/** `a: '{b}'`, `b: '{a}'` -- following the references never reaches a concrete value. */
export class CircularTokenReferenceError extends TokenError {
  constructor(readonly cycle: string[]) {
    super(`Circular token reference: ${cycle.join(' -> ')}.`);
  }
}

/** A reference resolved to a subtree where a single value was required, or vice versa. */
export class InvalidTokenPathError extends TokenError {
  constructor(
    readonly reference: string,
    readonly ownerPath: string,
    detail: string,
  ) {
    super(`Invalid token reference "{${reference}}" used by "${ownerPath}": ${detail}`);
  }
}

/**
 * The handful of defined paths closest to `target`, for "did you mean" hints. Ranked by a cheap
 * edit-distance-free heuristic (shared prefix, then shared last segment, then length delta) --
 * good enough for a developer-facing error message and far cheaper than Levenshtein over a few
 * thousand token paths.
 */
export function suggestTokenPaths(target: string, candidates: Iterable<string>, limit = 3): string[] {
  const lowered = target.toLowerCase();
  const lastSegment = lowered.split('.').pop() ?? lowered;

  return [...candidates]
    .map((candidate) => {
      const lc = candidate.toLowerCase();
      let score = 0;
      if (lc === lowered) score += 100;
      if (lc.includes(lowered) || lowered.includes(lc)) score += 40;
      if ((lc.split('.').pop() ?? lc) === lastSegment) score += 30;
      let shared = 0;
      while (shared < lc.length && shared < lowered.length && lc[shared] === lowered[shared]) shared++;
      score += shared;
      return { candidate, score };
    })
    .filter((entry) => entry.score >= 3)
    .sort((a, b) => b.score - a.score || a.candidate.length - b.candidate.length)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

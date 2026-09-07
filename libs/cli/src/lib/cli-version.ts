import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The version of `@semiui/cli` doing the work, stamped into `semiui.lock.json` so a later `update`
 * knows which published recipes a file came from.
 *
 * The published package is a single `index.cjs` sitting next to the `package.json` that
 * `generatePackageJson` writes, so `__dirname/package.json` is the real one at runtime. Running
 * from source (tests, ts-node) there is no such file next to the compiled entry, so fall back to
 * the library's own manifest in the repo -- the same shape `recipesRoot()` uses for recipes.
 */
export function cliVersion(): string {
  for (const candidate of [join(__dirname, 'package.json'), join(__dirname, '../../../../libs/cli/package.json')]) {
    if (existsSync(candidate)) {
      const version = JSON.parse(readFileSync(candidate, 'utf8')).version;
      if (typeof version === 'string') {
        return version;
      }
    }
  }
  return '0.0.0';
}

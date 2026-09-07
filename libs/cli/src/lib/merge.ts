import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface MergeResult {
  /** The merged text -- with conflict markers in it when `conflicts` is above zero. */
  content: string;
  /** Number of conflicting hunks git could not resolve on its own. */
  conflicts: number;
}

/**
 * True when `git merge-file` can be used. Every developer running an Angular CLI project has git
 * in practice, but `update` still has to degrade gracefully rather than crash when it's absent.
 */
export function gitAvailable(): boolean {
  try {
    execFileSync('git', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Three-way merge of one file: `ours` (what's on disk now), `base` (the pristine recipe from the
 * version recorded in the lockfile) and `theirs` (the recipe shipping in this CLI).
 *
 * Delegates to `git merge-file`, which is the same diff3 implementation git uses for a real merge
 * -- writing our own would mean maintaining a second, worse one. It exits 0 for a clean merge and
 * with the number of conflicts otherwise; anything negative or above 127 is a real failure.
 */
export function threeWayMerge(ours: string, base: string, theirs: string, labels: [string, string, string]): MergeResult {
  const dir = mkdtempSync(join(tmpdir(), 'semiui-merge-'));
  try {
    const oursPath = join(dir, 'ours');
    const basePath = join(dir, 'base');
    const theirsPath = join(dir, 'theirs');
    writeFileSync(oursPath, ours, 'utf8');
    writeFileSync(basePath, base, 'utf8');
    writeFileSync(theirsPath, theirs, 'utf8');

    let conflicts = 0;
    try {
      execFileSync(
        'git',
        ['merge-file', '-L', labels[0], '-L', labels[1], '-L', labels[2], oursPath, basePath, theirsPath],
        { stdio: 'ignore' },
      );
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (typeof status !== 'number' || status < 0 || status > 127) {
        throw error;
      }
      conflicts = status;
    }
    // git merge-file writes the result back into the `ours` file in place.
    return { content: readFileSync(oursPath, 'utf8'), conflicts };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

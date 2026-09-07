import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const LOCKFILE_NAME = 'semiui.lock.json';

export interface LockedFile {
  /**
   * The `@semiui/cli` release this file is based on -- the version whose recipe a later merge
   * should diff against. Normally that is the release the bytes were copied from; after a merge it
   * is the release that was merged in. Tracked per file, not per component:
   * an `update` can leave one file pinned (you edited it, or its merge conflicted) while moving
   * its siblings forward, and each one's baseline has to follow it independently -- a shared
   * component version would silently hand the next merge the wrong base.
   */
  version: string;
  /** sha256 of the bytes as written, so a later run can tell edited from untouched. */
  sha256: string;
  /**
   * Set when those bytes are a merge result rather than a pristine recipe. Without it the next
   * release would see a file matching its recorded hash, read that as "untouched since install",
   * and overwrite the developer's merged work with a clean copy.
   */
  merged?: true;
}

export interface LockedComponent {
  files: Record<string, LockedFile>;
}

export interface Lockfile {
  /** Schema version of this file, so a future format change can migrate instead of guessing. */
  lockfileVersion: 1;
  components: Record<string, LockedComponent>;
}

export function emptyLockfile(): Lockfile {
  return { lockfileVersion: 1, components: {} };
}

export function hashContent(content: string): string {
  // Normalised to LF first: git's autocrlf turns a checkout into CRLF on Windows, and hashing the
  // raw bytes would then report every file as edited on the next `update` for that developer.
  return createHash('sha256').update(content.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
}

function lockfilePath(cwd: string): string {
  return join(cwd, LOCKFILE_NAME);
}

export function lockfileExists(cwd: string): boolean {
  return existsSync(lockfilePath(cwd));
}

export function readLockfile(cwd: string): Lockfile {
  if (!lockfileExists(cwd)) {
    return emptyLockfile();
  }
  try {
    const parsed = JSON.parse(readFileSync(lockfilePath(cwd), 'utf8')) as Partial<Lockfile>;
    return { lockfileVersion: 1, components: parsed.components ?? {} };
  } catch {
    // A corrupt lockfile shouldn't wedge the CLI -- worst case every file reads as untracked, and
    // `add`/`update` write a fresh one.
    return emptyLockfile();
  }
}

export function writeLockfile(cwd: string, lockfile: Lockfile): void {
  const components = Object.fromEntries(Object.entries(lockfile.components).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(lockfilePath(cwd), JSON.stringify({ ...lockfile, components }, null, 2) + '\n', 'utf8');
}

/** Records one file as based on `version`, with the exact bytes just written. */
export function recordFile(
  lockfile: Lockfile,
  componentName: string,
  fileName: string,
  content: string,
  version: string,
  merged = false,
): void {
  const entry = (lockfile.components[componentName] ??= { files: {} });
  entry.files[fileName] = merged
    ? { version, sha256: hashContent(content), merged: true }
    : { version, sha256: hashContent(content) };
}

export function lockedFile(lockfile: Lockfile, componentName: string, fileName: string): LockedFile | undefined {
  return lockfile.components[componentName]?.files[fileName];
}

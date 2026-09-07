import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Lockfile, hashContent, lockedFile } from './lockfile';
import { RegistryComponent, getComponent, readRecipeFile } from './registry';

/** A conflict-block opener at the start of a line -- git's marker, not something in real source. */
const CONFLICT_MARKER = /^<<<<<<< /m;

export type FileState =
  /** On disk and byte-identical to the recipe shipping in this CLI. Nothing to do. */
  | 'up-to-date'
  /** Untouched since it was installed, and the recipe has moved on. Safe to overwrite outright. */
  | 'clean-update'
  /** Edited locally *and* changed upstream. Needs the three-way merge. */
  | 'merge-needed'
  /** Edited locally, but the recipe hasn't changed since. Leave it alone. */
  | 'local-only'
  /** Present on disk with no lockfile entry -- installed before lockfiles, or hand-written. */
  | 'untracked'
  /** Recorded in the lockfile but gone from disk. `update` puts it back. */
  | 'missing'
  /** Still carries conflict markers from an earlier merge. Off limits until a human resolves them. */
  | 'conflicted';

export interface FileStatus {
  component: string;
  file: string;
  path: string;
  state: FileState;
  /** The version recorded in the lockfile, when there is one. */
  fromVersion?: string;
  /** What's on disk right now. Absent for `missing`. */
  current?: string;
  /** The recipe shipping in this CLI. */
  next: string;
}

export interface ComponentStatus {
  component: RegistryComponent;
  files: FileStatus[];
}

/**
 * Classifies every file of a component without touching the network. The three hashes involved --
 * what's on disk, what the lockfile recorded at install time, and the recipe in this CLI -- are
 * enough to tell "you edited this" from "we changed this" from "both". Only `merge-needed` needs
 * the old published recipe, which is why fetching it is deferred to `update`.
 */
export function statusForComponent(
  cwd: string,
  componentsDir: string,
  name: string,
  lockfile: Lockfile,
  version: string,
): ComponentStatus | null {
  const component = getComponent(name);
  if (!component) {
    return null;
  }
  const files: FileStatus[] = [];

  for (const file of component.files) {
    const path = join(cwd, componentsDir, name, file);
    const next = readRecipeFile(name, file);
    const nextHash = hashContent(next);
    const locked = lockedFile(lockfile, name, file);
    const recordedHash = locked?.sha256;

    if (!existsSync(path)) {
      files.push({ component: name, file, path, state: 'missing', fromVersion: locked?.version, next });
      continue;
    }

    const current = readFileSync(path, 'utf8');
    if (CONFLICT_MARKER.test(current)) {
      // Merging again into a file that still has markers in it would nest a second set inside the
      // first and make the mess unreadable. It stays off limits until a human has dealt with it.
      files.push({ component: name, file, path, state: 'conflicted', fromVersion: locked?.version, current, next });
      continue;
    }
    const currentHash = hashContent(current);
    const base = { component: name, file, path, fromVersion: locked?.version, current, next };

    if (currentHash === nextHash) {
      // Identical to what ships now, whether or not it was ever tracked -- there is nothing to do
      // and nothing to merge, so `update` can adopt it into the lockfile.
      files.push({ ...base, state: 'up-to-date' });
    } else if (!locked) {
      files.push({ ...base, state: 'untracked' });
    } else if (locked.version === version) {
      // Its baseline is already this release, so the difference is the developer's, not ours --
      // whether they hand-edited it or resolved a merge into it. Nothing upstream left to apply.
      files.push({ ...base, state: 'local-only' });
    } else if (recordedHash === currentHash && !locked.merged) {
      // Byte-for-byte the recipe we wrote at install time, and that recipe has since moved on.
      // `merged` excludes the lookalike case: a file untouched since an earlier *merge* also
      // matches its recorded hash, but overwriting it would throw that merge away.
      files.push({ ...base, state: 'clean-update' });
    } else {
      files.push({ ...base, state: 'merge-needed' });
    }
  }

  return { component, files };
}

/** Component names that exist on disk under `componentsDir`, in registry order. */
export function installedComponentNames(cwd: string, componentsDir: string, lockfile: Lockfile, all: RegistryComponent[]): string[] {
  return all
    .map((component) => component.name)
    .filter(
      (name) =>
        lockfile.components[name] !== undefined ||
        existsSync(join(cwd, componentsDir, name)),
    );
}

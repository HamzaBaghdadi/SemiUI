import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { BaselineStore } from '../baseline';
import { cliVersion } from '../cli-version';
import { readConfig } from '../components-config';
import { readLockfile, recordFile, writeLockfile } from '../lockfile';
import { gitAvailable, threeWayMerge } from '../merge';
import { detectPackageManager, installDependencies } from '../package-manager';
import { listComponents } from '../registry';
import { FileStatus, installedComponentNames, statusForComponent } from '../status';

export interface UpdateOptions {
  /** Reports what would change without writing anything. */
  dryRun?: boolean;
  /** Overwrites edited files outright instead of merging. Destructive, and says so. */
  force?: boolean;
}

interface Outcome {
  file: FileStatus;
  result: 'updated' | 'restored' | 'merged' | 'conflicted' | 'overwritten' | 'skipped' | 'adopted';
  conflicts?: number;
}

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

export function runUpdate(cwd: string, componentName: string | undefined, options: UpdateOptions = {}): void {
  const config = readConfig(cwd);
  const lockfile = readLockfile(cwd);
  const version = cliVersion();
  const packageManager = detectPackageManager(cwd);
  // Old versions are fetched with the project's own package manager, so a private registry or
  // mirror configured for it applies here too.
  const baselines = new BaselineStore(packageManager);

  const names = componentName
    ? [componentName]
    : installedComponentNames(cwd, config.componentsDir, lockfile, listComponents());

  if (!names.length) {
    console.log('No SemiUI components found in this project. Add one with `semiui add <component>`.');
    return;
  }

  const outcomes: Outcome[] = [];
  const updatedComponents = new Set<string>();
  let warnedAboutGit = false;

  try {
    for (const name of names) {
      const status = statusForComponent(cwd, config.componentsDir, name, lockfile, version);
      if (!status) {
        console.error(`Unknown component "${name}".`);
        process.exitCode = 1;
        return;
      }

      for (const file of status.files) {
        switch (file.state) {
          case 'up-to-date':
            // Already matches what ships now. Adopt it so a *later* update has a baseline, which
            // is what makes this work for projects that predate the lockfile.
            if (!options.dryRun) {
              recordFile(lockfile, name, file.file, file.next, version);
            }
            outcomes.push({ file, result: 'adopted' });
            break;

          case 'local-only':
          case 'conflicted':
            outcomes.push({ file, result: 'skipped' });
            break;

          case 'missing':
            if (!options.dryRun) {
              write(file.path, file.next);
              recordFile(lockfile, name, file.file, file.next, version);
            }
            updatedComponents.add(name);
            outcomes.push({ file, result: 'restored' });
            break;

          case 'clean-update':
            if (!options.dryRun) {
              write(file.path, file.next);
              recordFile(lockfile, name, file.file, file.next, version);
            }
            updatedComponents.add(name);
            outcomes.push({ file, result: 'updated' });
            break;

          case 'untracked':
          case 'merge-needed': {
            if (options.force) {
              if (!options.dryRun) {
                write(file.path, file.next);
                recordFile(lockfile, name, file.file, file.next, version);
              }
              updatedComponents.add(name);
              outcomes.push({ file, result: 'overwritten' });
              break;
            }
            if (file.state === 'untracked') {
              // No recorded version means no baseline to merge against; guessing one would risk
              // silently reverting the developer's work.
              outcomes.push({ file, result: 'skipped' });
              break;
            }
            if (!gitAvailable()) {
              if (!warnedAboutGit) {
                console.warn('git not found -- edited files are left untouched. Install git, or re-run with --force to overwrite.');
                warnedAboutGit = true;
              }
              outcomes.push({ file, result: 'skipped' });
              break;
            }
            const base = baselines.read(file.fromVersion as string, name, file.file);
            if (base === null) {
              console.warn(`Could not fetch @semiui/cli@${file.fromVersion} for a baseline -- leaving ${file.file} alone.`);
              outcomes.push({ file, result: 'skipped' });
              break;
            }
            const merged = threeWayMerge(file.current as string, base, file.next, [
              'yours',
              `semiui ${file.fromVersion}`,
              `semiui ${version}`,
            ]);
            if (!options.dryRun) {
              write(file.path, merged.content);
              // Recorded at the *new* version even when it conflicted. The bytes on disk aren't a
              // pristine recipe either way, and what the lockfile really answers is "which release
              // is this file's baseline now" -- which is this one, since the merge has already been
              // applied. That makes the update after the developer resolves the markers a clean
              // no-op (base and theirs are then the same release) instead of replaying 1.1.0's
              // changes over work they just finished merging by hand.
              recordFile(lockfile, name, file.file, merged.content, version, true);
            }
            updatedComponents.add(name);
            outcomes.push({
              file,
              result: merged.conflicts ? 'conflicted' : 'merged',
              conflicts: merged.conflicts,
            });
            break;
          }
        }
      }
    }

    report(outcomes, version, options);

    if (options.dryRun) {
      return;
    }

    writeLockfile(cwd, lockfile);

    // A component can pick up a new npm dependency between versions, so install anything the
    // registry now asks for that a plain `update` would otherwise leave missing.
    const touched = listComponents().filter((component) => updatedComponents.has(component.name));
    const npmDependencies = [...new Set(touched.flatMap((component) => component.npmDependencies))];
    if (npmDependencies.length) {
      console.log(`\nChecking dependencies (${packageManager})...`);
      installDependencies(cwd, packageManager, npmDependencies);
    }
  } finally {
    baselines.cleanup();
  }
}

function report(outcomes: Outcome[], version: string, options: UpdateOptions): void {
  const byComponent = new Map<string, Outcome[]>();
  for (const outcome of outcomes) {
    const list = byComponent.get(outcome.file.component) ?? [];
    list.push(outcome);
    byComponent.set(outcome.file.component, list);
  }

  const verb = options.dryRun ? 'would be' : '';
  const noun: Record<Outcome['result'], string> = {
    updated: `updated${verb ? ' (dry run)' : ''}`,
    restored: 'restored (was missing)',
    merged: 'merged with your edits',
    conflicted: 'MERGED WITH CONFLICTS',
    overwritten: 'overwritten (--force)',
    skipped: 'left alone',
    adopted: 'up to date',
  };

  let changed = 0;
  for (const [name, list] of byComponent) {
    const interesting = list.filter((outcome) => outcome.result !== 'adopted');
    if (!interesting.length) {
      continue;
    }
    console.log(`\n${name}`);
    for (const outcome of interesting) {
      const detail =
        outcome.result === 'conflicted'
          ? ` (${outcome.conflicts} conflict${outcome.conflicts === 1 ? '' : 's'})`
          : outcome.result === 'skipped' && outcome.file.state === 'conflicted'
            ? ' -- unresolved conflict markers, resolve them first'
            : outcome.result === 'skipped' && outcome.file.state === 'local-only'
            ? ' -- you edited it, nothing new upstream'
            : outcome.result === 'skipped' && outcome.file.state === 'untracked'
              ? ' -- no baseline recorded, use --force to overwrite'
              : '';
      console.log(`  ${outcome.file.file.padEnd(34)} ${noun[outcome.result]}${detail}`);
      if (outcome.result !== 'skipped') {
        changed++;
      }
    }
  }

  const conflicted = outcomes.filter((outcome) => outcome.result === 'conflicted');
  if (conflicted.length) {
    console.log(`\n${conflicted.length} file${conflicted.length === 1 ? '' : 's'} need${conflicted.length === 1 ? 's' : ''} you to resolve conflict markers:`);
    for (const outcome of conflicted) {
      console.log(`  ${outcome.file.path}`);
    }
    console.log('\nSearch for <<<<<<< to find them -- everything outside those blocks is already');
    console.log('merged, and re-running update leaves these files alone until you have resolved them.');
    process.exitCode = 1;
  }

  if (!changed) {
    console.log(`Everything is up to date with semiui ${version}.`);
  } else if (options.dryRun) {
    console.log(`\nDry run -- nothing written. Drop --dry-run to apply.`);
  }
}

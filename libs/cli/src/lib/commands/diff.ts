import { readConfig } from '../components-config';
import { cliVersion } from '../cli-version';
import { diffStat, unifiedDiff } from '../diff';
import { readLockfile } from '../lockfile';
import { listComponents } from '../registry';
import { FileStatus, installedComponentNames, statusForComponent } from '../status';

export interface DiffOptions {
  /** Prints the full unified diff for each file instead of the one-line summary. */
  full?: boolean;
}

const LABEL: Record<FileStatus['state'], string> = {
  'up-to-date': 'up to date',
  'clean-update': 'update available',
  'merge-needed': 'update available (you edited this)',
  'local-only': 'edited by you, no upstream change',
  untracked: 'untracked -- no baseline recorded',
  missing: 'missing from disk',
  conflicted: 'unresolved conflict markers',
};

/** States `update` can actually act on -- the rest are printed for information only, so the
 * closing 'run semiui update' line stays honest when there is nothing for it to do. */
const ACTIONABLE = new Set<FileStatus['state']>(['clean-update', 'merge-needed', 'missing']);

/** States worth printing; `up-to-date` is the boring majority and never needs a row. */
function isInteresting(state: FileStatus['state']): boolean {
  return state !== 'up-to-date';
}

export function runDiff(cwd: string, componentName: string | undefined, options: DiffOptions = {}): void {
  const config = readConfig(cwd);
  const lockfile = readLockfile(cwd);
  const version = cliVersion();

  const names = componentName
    ? [componentName]
    : installedComponentNames(cwd, config.componentsDir, lockfile, listComponents());

  if (!names.length) {
    console.log('No SemiUI components found in this project. Add one with `semiui add <component>`.');
    return;
  }

  let interesting = 0;
  let actionable = 0;
  for (const name of names) {
    const status = statusForComponent(cwd, config.componentsDir, name, lockfile, version);
    if (!status) {
      console.error(`Unknown component "${name}".`);
      process.exitCode = 1;
      return;
    }

    const rows = status.files.filter((file) => isInteresting(file.state));
    if (!rows.length) {
      continue;
    }
    interesting += rows.length;
    actionable += rows.filter((file) => ACTIONABLE.has(file.state)).length;

    const from = status.files.find((file) => file.fromVersion)?.fromVersion;
    console.log(`\n${name}${from ? `  (based on ${from}, now on ${version})` : ''}`);
    for (const file of rows) {
      if (file.state === 'missing') {
        console.log(`  ${file.file.padEnd(34)} ${LABEL[file.state]}`);
        continue;
      }
      const stat = diffStat(file.current as string, file.next);
      const churn = stat.added || stat.removed ? `  +${stat.added} -${stat.removed}` : '';
      console.log(`  ${file.file.padEnd(34)} ${LABEL[file.state]}${churn}`);
      if (options.full) {
        const text = unifiedDiff(file.current as string, file.next, file.file, 'yours', `semiui ${version}`);
        if (text) {
          console.log(
            text
              .split('\n')
              .map((line) => `    ${line}`)
              .join('\n'),
          );
        }
      }
    }
  }

  if (!interesting) {
    console.log(`Everything is up to date with semiui ${version}.`);
    return;
  }
  if (!actionable) {
    console.log('\nNothing for `semiui update` to apply -- the rows above are your own changes.');
    return;
  }
  console.log(`\nRun \`semiui update\` to apply these${options.full ? '' : ', or `semiui diff --full` to see the changes'}.`);
}

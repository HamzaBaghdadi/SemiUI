import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cliVersion } from './cli-version';
import { PackageManager } from './package-manager';
import { readRecipeFile } from './registry';

export interface Attempt {
  command: PackageManager;
  args: string[];
}

/** Yarn Classic and Berry disagree on almost every flag, so the two need separate invocations. */
function yarnMajor(): number {
  try {
    const version = execFileSync('yarn', ['--version'], { encoding: 'utf8', shell: true }).trim();
    return Number.parseInt(version.split('.')[0], 10) || 1;
  } catch {
    return 1;
  }
}

/**
 * How to drop `spec` into `dir` with each package manager.
 *
 * `--ignore-workspace` / `--no-workspaces` matter more than they look: the temp directory is
 * usually under the OS temp root, but a developer whose TMPDIR sits inside their repo would
 * otherwise have this resolve as a workspace member and install into their real project.
 */
export function attemptFor(packageManager: PackageManager, spec: string, dir: string): Attempt {
  switch (packageManager) {
    case 'pnpm':
      return {
        command: 'pnpm',
        args: ['add', spec, '--dir', dir, '--ignore-workspace', '--prod', '--silent'],
      };
    case 'yarn':
      return yarnMajor() >= 2
        ? { command: 'yarn', args: ['--cwd', dir, 'add', spec] }
        : { command: 'yarn', args: ['--cwd', dir, 'add', spec, '--no-lockfile', '--silent'] };
    case 'npm':
    default:
      return {
        command: 'npm',
        args: ['install', spec, '--prefix', dir, '--no-save', '--no-audit', '--no-fund', '--no-workspaces', '--silent'],
      };
  }
}

/**
 * Reads recipe files as they shipped in an *older* published `@semiui/cli`, which is the "base"
 * side of `update`'s three-way merge -- without it, an edited file can only ever get a two-way
 * diff and the developer merges by hand.
 *
 * Old versions are pulled with the project's own package manager rather than by fetching and
 * unpacking the tarball here: it already does the fetch, integrity check and extraction, and it
 * does them against whatever registry, mirror or auth the project is configured for. That keeps
 * this package's own `dependencies` empty. One install per version per run, cached in memory, and
 * only ever triggered for files the developer actually edited.
 */
export class BaselineStore {
  private readonly roots = new Map<string, string | null>();
  private readonly tempDirs: string[] = [];

  constructor(
    private readonly packageManager: PackageManager = 'npm',
    private readonly packageName = '@semiui/cli',
  ) {}

  /** The recipe text at `version`, or `null` when that version can't be fetched. */
  read(version: string, componentName: string, fileName: string): string | null {
    // The running CLI already has its own recipes on disk -- no reason to go to the network for
    // the (common) case of re-running `update` against the version you're already on.
    if (version === cliVersion()) {
      try {
        return readRecipeFile(componentName, fileName);
      } catch {
        return null;
      }
    }
    const root = this.rootFor(version);
    if (!root) {
      return null;
    }
    const filePath = join(root, componentName, fileName);
    return existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
  }

  /** Deletes every temp install this store made. Safe to call more than once. */
  cleanup(): void {
    for (const dir of this.tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  private rootFor(version: string): string | null {
    const cached = this.roots.get(version);
    if (cached !== undefined) {
      return cached;
    }

    const dir = mkdtempSync(join(tmpdir(), 'semiui-baseline-'));
    this.tempDirs.push(dir);
    // pnpm refuses to install without one, and it stops npm/yarn walking up out of the temp
    // directory looking for a project to attach to. `private` keeps every manager from treating
    // this throwaway as something publishable.
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ name: 'semiui-baseline', version: '0.0.0', private: true }) + '\n',
      'utf8',
    );
    // Yarn Berry defaults to Plug'n'Play, which produces no node_modules to read recipes out of.
    // Harmless for every other manager, which ignores the file.
    writeFileSync(join(dir, '.yarnrc.yml'), 'nodeLinker: node-modules\n', 'utf8');

    const spec = `${this.packageName}@${version}`;
    // The project's own manager first, then npm as the safety net -- npm ships with Node, so it is
    // the one most likely to be there when the project's manager is missing or misconfigured.
    const attempts = [attemptFor(this.packageManager, spec, dir)];
    if (this.packageManager !== 'npm') {
      attempts.push(attemptFor('npm', spec, dir));
    }

    let root: string | null = null;
    for (const attempt of attempts) {
      try {
        execFileSync(attempt.command, attempt.args, { cwd: dir, stdio: 'ignore', shell: true });
      } catch {
        continue;
      }
      const recipes = join(dir, 'node_modules', ...this.packageName.split('/'), 'recipes');
      if (existsSync(recipes)) {
        root = recipes;
        break;
      }
    }

    this.roots.set(version, root);
    return root;
  }
}

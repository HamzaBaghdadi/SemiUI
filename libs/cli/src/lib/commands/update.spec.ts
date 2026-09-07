import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cliVersion } from '../cli-version';
import { hashContent, readLockfile, recordFile, writeLockfile } from '../lockfile';
import { installDependencies } from '../package-manager';
import { readRecipeFile } from '../registry';
import { runAdd } from './add';
import { runUpdate } from './update';

jest.mock('../package-manager', () => ({
  ...jest.requireActual('../package-manager'),
  installDependencies: jest.fn(),
}));

// `update` only reaches for an old published version when a file needs a real three-way merge;
// stubbing the store keeps these tests offline and deterministic.
const baselineContent = jest.fn<string | null, [string, string, string]>();
jest.mock('../baseline', () => ({
  BaselineStore: class {
    read(version: string, component: string, file: string): string | null {
      return baselineContent(version, component, file);
    }
    cleanup(): void {
      /* nothing to clean in the stub */
    }
  },
}));

const DIR = 'src/app/components';

describe('runUpdate', () => {
  let cwd: string;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  const buttonFile = (file: string) => join(cwd, DIR, 'button', file);
  const recipe = (file: string) => readRecipeFile('button', file);

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'semiui-update-'));
    jest.mocked(installDependencies).mockClear();
    baselineContent.mockReset();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    process.exitCode = undefined;
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
    logSpy.mockRestore();
    warnSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('restores a tracked file that was deleted from disk', () => {
    runAdd(cwd, 'button');
    rmSync(buttonFile('button.component.ts'));

    runUpdate(cwd, 'button');

    expect(readFileSync(buttonFile('button.component.ts'), 'utf8')).toBe(recipe('button.component.ts'));
  });

  it('overwrites a file that is untouched since an older install', () => {
    runAdd(cwd, 'button');
    // Rewind the lockfile to an older release whose bytes differed, and put those bytes on disk.
    const old = recipe('button.component.css') + '\n/* from 1.0.0 */\n';
    writeFileSync(buttonFile('button.component.css'), old, 'utf8');
    const lockfile = readLockfile(cwd);
    recordFile(lockfile, 'button', 'button.component.css', old, '1.0.0');
    writeLockfile(cwd, lockfile);

    runUpdate(cwd, 'button');

    expect(readFileSync(buttonFile('button.component.css'), 'utf8')).toBe(recipe('button.component.css'));
    expect(readLockfile(cwd).components['button'].files['button.component.css'].version).toBe(cliVersion());
  });

  it('leaves an edited file alone when nothing changed upstream', () => {
    runAdd(cwd, 'button');
    const mine = recipe('button.component.css') + '\n/* mine */\n';
    writeFileSync(buttonFile('button.component.css'), mine, 'utf8');

    runUpdate(cwd, 'button');

    expect(readFileSync(buttonFile('button.component.css'), 'utf8')).toBe(mine);
    expect(baselineContent).not.toHaveBeenCalled();
  });

  it('writes nothing under --dry-run', () => {
    runAdd(cwd, 'button');
    rmSync(buttonFile('button.component.ts'));
    const before = readFileSync(join(cwd, 'semiui.lock.json'), 'utf8');

    runUpdate(cwd, 'button', { dryRun: true });

    expect(() => readFileSync(buttonFile('button.component.ts'), 'utf8')).toThrow();
    expect(readFileSync(join(cwd, 'semiui.lock.json'), 'utf8')).toBe(before);
  });

  it('three-way merges an edited file against the version it was installed from', () => {
    runAdd(cwd, 'button');
    // Base: an old release with a marker line. Ours: that, plus a local edit at the far end.
    const base = `/* header */\n${recipe('button.component.css')}`;
    const ours = `${base}\n/* my override */\n`;
    writeFileSync(buttonFile('button.component.css'), ours, 'utf8');
    const lockfile = readLockfile(cwd);
    recordFile(lockfile, 'button', 'button.component.css', base, '1.0.0');
    writeLockfile(cwd, lockfile);
    baselineContent.mockReturnValue(base);

    runUpdate(cwd, 'button');

    const merged = readFileSync(buttonFile('button.component.css'), 'utf8');
    expect(baselineContent).toHaveBeenCalledWith('1.0.0', 'button', 'button.component.css');
    // Upstream dropped the header; the local edit at the other end survives.
    expect(merged).toContain('/* my override */');
    expect(merged).not.toContain('/* header */');
    expect(merged).not.toContain('<<<<<<<');
  });

  it('marks a merged file so a later release will not overwrite it', () => {
    runAdd(cwd, 'button');
    const base = `/* header */\n${recipe('button.component.css')}`;
    writeFileSync(buttonFile('button.component.css'), `${base}\n/* my override */\n`, 'utf8');
    const lockfile = readLockfile(cwd);
    recordFile(lockfile, 'button', 'button.component.css', base, '1.0.0');
    writeLockfile(cwd, lockfile);
    baselineContent.mockReturnValue(base);

    runUpdate(cwd, 'button');

    expect(readLockfile(cwd).components['button'].files['button.component.css'].merged).toBe(true);
  });

  it('leaves an edited file untouched when the old version cannot be fetched', () => {
    runAdd(cwd, 'button');
    const ours = recipe('button.component.css') + '\n/* mine */\n';
    writeFileSync(buttonFile('button.component.css'), ours, 'utf8');
    const lockfile = readLockfile(cwd);
    recordFile(lockfile, 'button', 'button.component.css', 'something else entirely', '1.0.0');
    writeLockfile(cwd, lockfile);
    baselineContent.mockReturnValue(null);

    runUpdate(cwd, 'button');

    expect(readFileSync(buttonFile('button.component.css'), 'utf8')).toBe(ours);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('1.0.0'));
  });

  it('overwrites an edited file under --force, without consulting a baseline', () => {
    runAdd(cwd, 'button');
    writeFileSync(buttonFile('button.component.css'), 'totally different', 'utf8');
    const lockfile = readLockfile(cwd);
    recordFile(lockfile, 'button', 'button.component.css', 'was this', '1.0.0');
    writeLockfile(cwd, lockfile);

    runUpdate(cwd, 'button', { force: true });

    expect(readFileSync(buttonFile('button.component.css'), 'utf8')).toBe(recipe('button.component.css'));
    expect(baselineContent).not.toHaveBeenCalled();
  });

  it('adopts an untracked file that already matches the shipped recipe', () => {
    mkdirSync(join(cwd, DIR, 'button'), { recursive: true });
    for (const file of ['button.component.ts', 'button.component.html', 'button.component.css']) {
      writeFileSync(buttonFile(file), recipe(file), 'utf8');
    }

    runUpdate(cwd, 'button');

    const locked = readLockfile(cwd).components['button'].files['button.component.ts'];
    expect(locked.version).toBe(cliVersion());
    expect(locked.sha256).toBe(hashContent(recipe('button.component.ts')));
  });

  it('reports an unknown component', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    runUpdate(cwd, 'not-a-component');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('not-a-component'));
    expect(process.exitCode).toBe(1);
    errorSpy.mockRestore();
  });
});

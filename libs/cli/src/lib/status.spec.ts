import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Lockfile, emptyLockfile, hashContent, recordFile } from './lockfile';
import { readRecipeFile } from './registry';
import { statusForComponent } from './status';

const COMPONENTS_DIR = 'src/app/components';
const NOW = '2.0.0';
const THEN = '1.0.0';

describe('statusForComponent', () => {
  let cwd: string;
  let lockfile: Lockfile;

  const pristine = (file: string) => readRecipeFile('button', file);
  const buttonDir = () => join(cwd, COMPONENTS_DIR, 'button');
  const put = (file: string, content: string) => writeFileSync(join(buttonDir(), file), content, 'utf8');
  const stateOf = (file: string) =>
    statusForComponent(cwd, COMPONENTS_DIR, 'button', lockfile, NOW)?.files.find((f) => f.file === file)?.state;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'semiui-status-'));
    mkdirSync(buttonDir(), { recursive: true });
    lockfile = emptyLockfile();
    for (const file of ['button.component.ts', 'button.component.html', 'button.component.css']) {
      put(file, pristine(file));
    }
  });

  afterEach(() => rmSync(cwd, { recursive: true, force: true }));

  it('reports a file matching the shipped recipe as up to date, tracked or not', () => {
    expect(stateOf('button.component.ts')).toBe('up-to-date');
  });

  it('reports a file with no lockfile entry that differs from the recipe as untracked', () => {
    put('button.component.ts', pristine('button.component.ts') + '\n// mine\n');
    expect(stateOf('button.component.ts')).toBe('untracked');
  });

  it('reports an untouched file whose recipe has moved on as a clean update', () => {
    // Recorded at an older version, with the hash of *different* bytes than ship today.
    const old = pristine('button.component.ts') + '\n// shipped in 1.0.0\n';
    put('button.component.ts', old);
    recordFile(lockfile, 'button', 'button.component.ts', old, THEN);
    expect(stateOf('button.component.ts')).toBe('clean-update');
  });

  it('reports a file edited since an older install as needing a merge', () => {
    const old = pristine('button.component.ts') + '\n// shipped in 1.0.0\n';
    recordFile(lockfile, 'button', 'button.component.ts', old, THEN);
    put('button.component.ts', old + '\n// and then I edited it\n');
    expect(stateOf('button.component.ts')).toBe('merge-needed');
  });

  it('treats a file already based on the current release as the developer\'s own', () => {
    recordFile(lockfile, 'button', 'button.component.ts', 'whatever was written', NOW);
    put('button.component.ts', pristine('button.component.ts') + '\n// my tweak\n');
    expect(stateOf('button.component.ts')).toBe('local-only');
  });

  it('never offers to overwrite a file left over from an earlier merge', () => {
    // The lookalike case: untouched since a merge, so it matches its own recorded hash -- but
    // those bytes are the developer's merged work, not a recipe we could safely replace.
    const mergedContent = pristine('button.component.ts') + '\n// merged in by hand\n';
    recordFile(lockfile, 'button', 'button.component.ts', mergedContent, THEN, true);
    put('button.component.ts', mergedContent);
    expect(stateOf('button.component.ts')).toBe('merge-needed');
  });

  it('refuses to touch a file that still has conflict markers in it', () => {
    put('button.component.ts', ['const a = 1;', '<<<<<<< yours', 'mine', '=======', 'theirs', '>>>>>>> semiui 2.0.0'].join('\n'));
    recordFile(lockfile, 'button', 'button.component.ts', 'anything', THEN);
    expect(stateOf('button.component.ts')).toBe('conflicted');
  });

  it('reports a tracked file deleted from disk as missing', () => {
    recordFile(lockfile, 'button', 'button.component.ts', pristine('button.component.ts'), THEN);
    rmSync(join(buttonDir(), 'button.component.ts'));
    expect(stateOf('button.component.ts')).toBe('missing');
  });

  it('ignores CRLF/LF differences so a Windows checkout does not read as edited', () => {
    const recipe = pristine('button.component.ts');
    recordFile(lockfile, 'button', 'button.component.ts', recipe, NOW);
    put('button.component.ts', recipe.replace(/\r?\n/g, '\r\n'));
    expect(hashContent(recipe)).toBe(hashContent(recipe.replace(/\r?\n/g, '\r\n')));
    expect(stateOf('button.component.ts')).toBe('up-to-date');
  });

  it('returns null for a component that is not in the registry', () => {
    expect(statusForComponent(cwd, COMPONENTS_DIR, 'not-a-component', lockfile, NOW)).toBeNull();
  });
});

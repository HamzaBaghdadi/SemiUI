import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installDependencies } from '../package-manager';
import { runAdd } from './add';

jest.mock('../package-manager', () => ({
  ...jest.requireActual('../package-manager'),
  installDependencies: jest.fn(),
}));

describe('runAdd', () => {
  let cwd: string;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'zaytoon-cli-test-'));
    jest.mocked(installDependencies).mockClear();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    process.exitCode = undefined;
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
    logSpy.mockRestore();
    errorSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('copies the button recipe files into the default components dir', () => {
    runAdd(cwd, 'button');

    const targetDir = join(cwd, 'src/app/components/button');
    expect(existsSync(join(targetDir, 'button.component.ts'))).toBe(true);
    expect(existsSync(join(targetDir, 'button.component.html'))).toBe(true);
    expect(existsSync(join(targetDir, 'button.component.css'))).toBe(true);
    expect(readFileSync(join(targetDir, 'button.component.ts'), 'utf8')).toContain('export class ButtonComponent');
  });

  it('installs the component npm dependencies', () => {
    runAdd(cwd, 'button');

    expect(installDependencies).toHaveBeenCalledWith(
      cwd,
      'npm',
      expect.arrayContaining(['@zaytoon/primitives', '@zaytoon/tokens', '@zaytoon/theme']),
    );
  });

  it('respects a custom componentsDir from components.json', () => {
    writeFileSync(
      join(cwd, 'components.json'),
      JSON.stringify({ preset: 'aurora', componentsDir: 'src/app/ui', prefix: 'z' }),
      'utf8',
    );

    runAdd(cwd, 'button');

    expect(existsSync(join(cwd, 'src/app/ui/button/button.component.ts'))).toBe(true);
  });

  it('does not overwrite a file the user already has', () => {
    const targetDir = join(cwd, 'src/app/components/button');
    runAdd(cwd, 'button');
    writeFileSync(join(targetDir, 'button.component.ts'), '// user edits', 'utf8');

    runAdd(cwd, 'button');

    expect(readFileSync(join(targetDir, 'button.component.ts'), 'utf8')).toBe('// user edits');
  });

  it('prints usage and exits non-zero when no component name is given', () => {
    runAdd(cwd, undefined);

    expect(process.exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('prints an error and exits non-zero for an unknown component', () => {
    runAdd(cwd, 'does-not-exist');

    expect(process.exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown component'));
  });
});

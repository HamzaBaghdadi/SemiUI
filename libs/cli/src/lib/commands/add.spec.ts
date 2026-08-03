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
    cwd = mkdtempSync(join(tmpdir(), 'semiui-cli-test-'));
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
      expect.arrayContaining(['@semiui/primitives', '@semiui/tokens', '@semiui/theme']),
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

  it('also copies recipe dependencies (text-input depends on error-message)', () => {
    runAdd(cwd, 'text-input');

    expect(existsSync(join(cwd, 'src/app/components/text-input/text-input.component.ts'))).toBe(true);
    expect(existsSync(join(cwd, 'src/app/components/error-message/error-message.component.ts'))).toBe(true);
    expect(
      readFileSync(join(cwd, 'src/app/components/error-message/error-message.component.ts'), 'utf8'),
    ).toContain('export class ErrorMessageComponent');
  });

  it('does not overwrite an already-installed recipe dependency', () => {
    runAdd(cwd, 'text-input');
    const errorMessagePath = join(cwd, 'src/app/components/error-message/error-message.component.ts');
    writeFileSync(errorMessagePath, '// user edits', 'utf8');

    runAdd(cwd, 'password'); // also depends on error-message

    expect(readFileSync(errorMessagePath, 'utf8')).toBe('// user edits');
  });

  it('--all installs every registry component', () => {
    runAdd(cwd, undefined, { all: true });

    expect(existsSync(join(cwd, 'src/app/components/button/button.component.ts'))).toBe(true);
    expect(existsSync(join(cwd, 'src/app/components/dialog/dialog.component.ts'))).toBe(true);
    expect(existsSync(join(cwd, 'src/app/components/dialog/dialog.service.ts'))).toBe(true);
    // A recipe dependency (error-message, depended on by text-input/password/etc.) is only copied once.
    expect(existsSync(join(cwd, 'src/app/components/error-message/error-message.component.ts'))).toBe(true);
  });

  it('--all does not require a component name', () => {
    runAdd(cwd, undefined, { all: true });

    expect(process.exitCode).toBeUndefined();
  });

  it('--path overrides componentsDir for this invocation only, without touching components.json', () => {
    runAdd(cwd, 'button', { path: 'src/lib/ui' });

    expect(existsSync(join(cwd, 'src/lib/ui/button/button.component.ts'))).toBe(true);
    expect(existsSync(join(cwd, 'components.json'))).toBe(false);
  });

  it('--all and --path together install everything into the custom directory', () => {
    runAdd(cwd, undefined, { all: true, path: 'src/lib/ui' });

    expect(existsSync(join(cwd, 'src/lib/ui/button/button.component.ts'))).toBe(true);
    expect(existsSync(join(cwd, 'src/lib/ui/dialog/dialog.service.ts'))).toBe(true);
  });
});

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installDependencies } from '../package-manager';
import { runInit } from './init';

jest.mock('../package-manager', () => ({
  ...jest.requireActual('../package-manager'),
  installDependencies: jest.fn(),
}));

describe('runInit', () => {
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

  it('refuses to run outside an Angular project', async () => {
    await runInit(cwd);

    expect(process.exitCode).toBe(1);
    expect(existsSync(join(cwd, 'components.json'))).toBe(false);
    expect(installDependencies).not.toHaveBeenCalled();
  });

  it('defaults to the Semi preset when stdin is not a TTY (CI, tests)', async () => {
    writeFileSync(join(cwd, 'angular.json'), '{}', 'utf8');

    await runInit(cwd);

    const config = JSON.parse(readFileSync(join(cwd, 'components.json'), 'utf8'));
    expect(config).toEqual({ preset: 'semi', componentsDir: 'src/app/components', prefix: 's' });
    expect(installDependencies).toHaveBeenCalledWith(
      cwd,
      'npm',
      expect.arrayContaining(['@semiui/tokens', '@semiui/theme', '@semiui/primitives', '@semiui/presets-semi']),
    );
    expect(installDependencies).toHaveBeenCalledWith(cwd, 'npm', ['@semiui/cli'], true);
  });

  it('installs the Aurora preset package when --preset aurora is passed', async () => {
    writeFileSync(join(cwd, 'angular.json'), '{}', 'utf8');

    await runInit(cwd, { preset: 'aurora' });

    const config = JSON.parse(readFileSync(join(cwd, 'components.json'), 'utf8'));
    expect(config.preset).toBe('aurora');
    expect(installDependencies).toHaveBeenCalledWith(
      cwd,
      'npm',
      expect.arrayContaining(['@semiui/tokens', '@semiui/theme', '@semiui/primitives', '@semiui/presets-aurora']),
    );
  });

  it('does not overwrite an existing components.json', async () => {
    writeFileSync(join(cwd, 'angular.json'), '{}', 'utf8');
    writeFileSync(join(cwd, 'components.json'), JSON.stringify({ preset: 'custom' }), 'utf8');

    await runInit(cwd);

    expect(JSON.parse(readFileSync(join(cwd, 'components.json'), 'utf8'))).toEqual({ preset: 'custom' });
  });

  it('reads the preset from an existing components.json to pick which package to install', async () => {
    writeFileSync(join(cwd, 'angular.json'), '{}', 'utf8');
    writeFileSync(join(cwd, 'components.json'), JSON.stringify({ preset: 'aurora' }), 'utf8');

    await runInit(cwd);

    expect(installDependencies).toHaveBeenCalledWith(
      cwd,
      'npm',
      expect.arrayContaining(['@semiui/presets-aurora']),
    );
  });
});

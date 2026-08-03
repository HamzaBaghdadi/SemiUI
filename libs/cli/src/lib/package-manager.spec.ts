import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectPackageManager, installDependencies } from './package-manager';

jest.mock('node:child_process');

describe('detectPackageManager', () => {
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'semiui-cli-test-'));
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it('defaults to npm when no lockfile is present', () => {
    expect(detectPackageManager(cwd)).toBe('npm');
  });

  it('detects pnpm from pnpm-lock.yaml', () => {
    writeFileSync(join(cwd, 'pnpm-lock.yaml'), '', 'utf8');
    expect(detectPackageManager(cwd)).toBe('pnpm');
  });

  it('detects yarn from yarn.lock', () => {
    writeFileSync(join(cwd, 'yarn.lock'), '', 'utf8');
    expect(detectPackageManager(cwd)).toBe('yarn');
  });
});

describe('installDependencies', () => {
  beforeEach(() => {
    jest.mocked(execFileSync).mockClear();
  });

  it('does nothing for an empty package list', () => {
    installDependencies('/some/dir', 'npm', []);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it('runs `npm install <packages>`', () => {
    installDependencies('/some/dir', 'npm', ['@semiui/tokens']);
    expect(execFileSync).toHaveBeenCalledWith(
      'npm',
      ['install', '@semiui/tokens'],
      expect.objectContaining({ cwd: '/some/dir' }),
    );
  });

  it('runs `yarn add <packages>` for yarn', () => {
    installDependencies('/some/dir', 'yarn', ['@semiui/tokens']);
    expect(execFileSync).toHaveBeenCalledWith('yarn', ['add', '@semiui/tokens'], expect.anything());
  });

  it('runs `npm install -D <packages>` when dev is true', () => {
    installDependencies('/some/dir', 'npm', ['@semiui/cli'], true);
    expect(execFileSync).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', '@semiui/cli'],
      expect.objectContaining({ cwd: '/some/dir' }),
    );
  });

  it('runs `yarn add -D <packages>` for yarn when dev is true', () => {
    installDependencies('/some/dir', 'yarn', ['@semiui/cli'], true);
    expect(execFileSync).toHaveBeenCalledWith('yarn', ['add', '-D', '@semiui/cli'], expect.anything());
  });
});

import { execFileSync } from 'node:child_process';
import { attemptFor } from './baseline';

jest.mock('node:child_process', () => ({ execFileSync: jest.fn() }));

const SPEC = '@semiui/cli@1.1.0';
const DIR = '/tmp/baseline';

describe('attemptFor', () => {
  beforeEach(() => jest.mocked(execFileSync).mockReset());

  it('installs into the temp prefix with npm', () => {
    expect(attemptFor('npm', SPEC, DIR)).toEqual({
      command: 'npm',
      args: ['install', SPEC, '--prefix', DIR, '--no-save', '--no-audit', '--no-fund', '--no-workspaces', '--silent'],
    });
  });

  it('installs into the temp dir with pnpm, outside any workspace', () => {
    const attempt = attemptFor('pnpm', SPEC, DIR);
    expect(attempt.command).toBe('pnpm');
    expect(attempt.args).toEqual(['add', SPEC, '--dir', DIR, '--ignore-workspace', '--prod', '--silent']);
  });

  it('uses Yarn Classic flags for yarn 1', () => {
    jest.mocked(execFileSync).mockReturnValue('1.22.22\n' as never);
    expect(attemptFor('yarn', SPEC, DIR)).toEqual({
      command: 'yarn',
      // --no-lockfile and --silent exist in Classic only.
      args: ['--cwd', DIR, 'add', SPEC, '--no-lockfile', '--silent'],
    });
  });

  it('drops the Classic-only flags for Yarn Berry, which rejects them', () => {
    jest.mocked(execFileSync).mockReturnValue('4.5.0\n' as never);
    expect(attemptFor('yarn', SPEC, DIR)).toEqual({
      command: 'yarn',
      args: ['--cwd', DIR, 'add', SPEC],
    });
  });

  it('falls back to Classic flags when yarn --version cannot be read', () => {
    jest.mocked(execFileSync).mockImplementation(() => {
      throw new Error('yarn not found');
    });
    expect(attemptFor('yarn', SPEC, DIR).args).toContain('--no-lockfile');
  });

  it('keeps every manager out of the developer\'s real workspace', () => {
    // A TMPDIR inside the repo would otherwise let the throwaway install resolve as a workspace
    // member and write into the actual project.
    expect(attemptFor('npm', SPEC, DIR).args).toContain('--no-workspaces');
    expect(attemptFor('pnpm', SPEC, DIR).args).toContain('--ignore-workspace');
  });
});

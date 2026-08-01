import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_CONFIG, configExists, readConfig, writeConfig } from './components-config';

describe('components-config', () => {
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'zaytoon-cli-test-'));
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it('configExists is false when no components.json is present', () => {
    expect(configExists(cwd)).toBe(false);
  });

  it('readConfig returns defaults when no components.json is present', () => {
    expect(readConfig(cwd)).toEqual(DEFAULT_CONFIG);
  });

  it('writeConfig then readConfig round-trips', () => {
    const custom = { preset: 'aurora', componentsDir: 'src/app/ui', prefix: 'app' };
    writeConfig(cwd, custom);

    expect(configExists(cwd)).toBe(true);
    expect(readConfig(cwd)).toEqual(custom);
  });

  it('readConfig fills in missing fields with defaults', () => {
    writeConfig(cwd, { ...DEFAULT_CONFIG, componentsDir: 'src/app/ui' });

    expect(readConfig(cwd)).toEqual({ ...DEFAULT_CONFIG, componentsDir: 'src/app/ui' });
  });
});

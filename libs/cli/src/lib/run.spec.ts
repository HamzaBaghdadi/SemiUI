import { runAdd } from './commands/add';
import { runInit } from './commands/init';
import { run } from './run';

// Partial mock -- only runInit is a spy. A full jest.mock() here would also auto-mock
// isPresetName (used directly by run.ts's own flag parsing) into a stub that always returns
// undefined, silently breaking --preset for every value including ones that should work.
jest.mock('./commands/init', () => ({
  ...jest.requireActual('./commands/init'),
  runInit: jest.fn(),
}));
jest.mock('./commands/add');

describe('run', () => {
  const cwd = '/project';

  beforeEach(() => {
    jest.mocked(runInit).mockClear();
    jest.mocked(runAdd).mockClear();
    process.exitCode = undefined;
  });

  it('dispatches `init` to runInit', () => {
    run(['init'], cwd);
    expect(runInit).toHaveBeenCalledWith(cwd, {});
  });

  it('dispatches `init --preset aurora` with the preset option', () => {
    run(['init', '--preset', 'aurora'], cwd);
    expect(runInit).toHaveBeenCalledWith(cwd, { preset: 'aurora' });
  });

  it('ignores an invalid --preset value', () => {
    run(['init', '--preset', 'bogus'], cwd);
    expect(runInit).toHaveBeenCalledWith(cwd, {});
  });

  it.each(['material', 'carbon', 'fluent', 'cupertino', 'samsung'] as const)(
    'dispatches `init --preset %s` with the preset option',
    (preset) => {
      run(['init', '--preset', preset], cwd);
      expect(runInit).toHaveBeenCalledWith(cwd, { preset });
    },
  );

  it('dispatches `add <name>` to runAdd with the component name', () => {
    run(['add', 'button'], cwd);
    expect(runAdd).toHaveBeenCalledWith(cwd, 'button', {});
  });

  it('dispatches `add` with no name to runAdd(undefined) so it can print usage', () => {
    run(['add'], cwd);
    expect(runAdd).toHaveBeenCalledWith(cwd, undefined, {});
  });

  it('dispatches `add --all` to runAdd with the all option', () => {
    run(['add', '--all'], cwd);
    expect(runAdd).toHaveBeenCalledWith(cwd, undefined, { all: true });
  });

  it('dispatches `add <name> --path <dir>` to runAdd with the path option', () => {
    run(['add', 'button', '--path', 'src/lib/ui'], cwd);
    expect(runAdd).toHaveBeenCalledWith(cwd, 'button', { path: 'src/lib/ui' });
  });

  it('accepts -p as a shorthand for --path', () => {
    run(['add', 'button', '-p', 'src/lib/ui'], cwd);
    expect(runAdd).toHaveBeenCalledWith(cwd, 'button', { path: 'src/lib/ui' });
  });

  it('dispatches `add --all --path <dir>` with both options', () => {
    run(['add', '--all', '--path', 'src/lib/ui'], cwd);
    expect(runAdd).toHaveBeenCalledWith(cwd, undefined, { all: true, path: 'src/lib/ui' });
  });

  it('prints help and does not error for no command', () => {
    run([], cwd);
    expect(process.exitCode).toBeUndefined();
    expect(runInit).not.toHaveBeenCalled();
    expect(runAdd).not.toHaveBeenCalled();
  });

  it('sets a non-zero exit code for an unknown command', () => {
    run(['bogus'], cwd);
    expect(process.exitCode).toBe(1);
  });
});

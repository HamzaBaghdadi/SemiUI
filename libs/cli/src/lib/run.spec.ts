import { runAdd } from './commands/add';
import { runInit } from './commands/init';
import { run } from './run';

jest.mock('./commands/init');
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
    expect(runInit).toHaveBeenCalledWith(cwd);
  });

  it('dispatches `add <name>` to runAdd with the component name', () => {
    run(['add', 'button'], cwd);
    expect(runAdd).toHaveBeenCalledWith(cwd, 'button');
  });

  it('dispatches `add` with no name to runAdd(undefined) so it can print usage', () => {
    run(['add'], cwd);
    expect(runAdd).toHaveBeenCalledWith(cwd, undefined);
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

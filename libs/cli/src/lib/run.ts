import { AddOptions, runAdd } from './commands/add';
import { DiffOptions, runDiff } from './commands/diff';
import { InitOptions, isPresetName, runInit } from './commands/init';
import { UpdateOptions, runUpdate } from './commands/update';

const PRESET_NAMES = 'semi, aurora, material, carbon, fluent, cupertino, or samsung';

const HELP = `semiui -- CLI for the SemiUI component library

Usage:
  semiui init                     Set up SemiUI in the current Angular project
  semiui init --preset <name>      Skip the interactive prompt (${PRESET_NAMES})
  semiui add <name>                Add a component's source into your project
  semiui add --all                 Add every component in the library
  semiui add <name> --path <dir>   Add into a custom directory for this run (overrides components.json)
  semiui diff [name]               Show what the library changed since you installed
  semiui diff [name] --full        ...with the full unified diff for each file
  semiui update [name]             Pull library changes into your copies (3-way merge on edited files)
  semiui update --dry-run          Report what update would do, without writing
  semiui update --force            Overwrite edited files instead of merging (destructive)

Your installs are tracked in semiui.lock.json -- commit it. That's what lets "update" know which
version each file came from, so it can merge library changes into your edits instead of
clobbering them.
`;

function parseInitArgs(args: string[]): InitOptions {
  const options: InitOptions = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--preset' || arg === '-p') {
      const value = args[++i];
      if (isPresetName(value)) {
        options.preset = value;
      }
    }
  }
  return options;
}

function parseDiffArgs(args: string[]): { componentName: string | undefined; options: DiffOptions } {
  let componentName: string | undefined;
  const options: DiffOptions = {};
  for (const arg of args) {
    if (arg === '--full' || arg === '-f') {
      options.full = true;
    } else if (componentName === undefined && !arg.startsWith('-')) {
      componentName = arg;
    }
  }
  return { componentName, options };
}

function parseUpdateArgs(args: string[]): { componentName: string | undefined; options: UpdateOptions } {
  let componentName: string | undefined;
  const options: UpdateOptions = {};
  for (const arg of args) {
    if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (componentName === undefined && !arg.startsWith('-')) {
      componentName = arg;
    }
  }
  return { componentName, options };
}

function parseAddArgs(args: string[]): { componentName: string | undefined; options: AddOptions } {
  let componentName: string | undefined;
  const options: AddOptions = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all') {
      options.all = true;
    } else if (arg === '--path' || arg === '-p') {
      options.path = args[++i];
    } else if (componentName === undefined) {
      componentName = arg;
    }
  }
  return { componentName, options };
}

export async function run(argv: string[], cwd: string = process.cwd()): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case 'init':
      await runInit(cwd, parseInitArgs(rest));
      break;
    case 'add': {
      const { componentName, options } = parseAddArgs(rest);
      runAdd(cwd, componentName, options);
      break;
    }
    case 'diff': {
      const { componentName, options } = parseDiffArgs(rest);
      runDiff(cwd, componentName, options);
      break;
    }
    case 'update': {
      const { componentName, options } = parseUpdateArgs(rest);
      runUpdate(cwd, componentName, options);
      break;
    }
    case undefined:
    case '--help':
    case '-h':
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command "${command}".\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

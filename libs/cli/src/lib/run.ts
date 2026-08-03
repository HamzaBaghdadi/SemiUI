import { AddOptions, runAdd } from './commands/add';
import { runInit } from './commands/init';

const HELP = `semiui -- CLI for the SemiUI component library

Usage:
  semiui init                     Set up SemiUI in the current Angular project
  semiui add <name>                Add a component's source into your project
  semiui add --all                 Add every component in the library
  semiui add <name> --path <dir>   Add into a custom directory for this run (overrides components.json)
`;

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

export function run(argv: string[], cwd: string = process.cwd()): void {
  const [command, ...rest] = argv;

  switch (command) {
    case 'init':
      runInit(cwd);
      break;
    case 'add': {
      const { componentName, options } = parseAddArgs(rest);
      runAdd(cwd, componentName, options);
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

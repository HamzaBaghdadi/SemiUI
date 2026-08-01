import { runAdd } from './commands/add';
import { runInit } from './commands/init';

const HELP = `zaytoon -- CLI for the Zaytoon component library

Usage:
  zaytoon init          Set up Zaytoon in the current Angular project
  zaytoon add <name>    Add a component's source into your project
`;

export function run(argv: string[], cwd: string = process.cwd()): void {
  const [command, ...rest] = argv;

  switch (command) {
    case 'init':
      runInit(cwd);
      break;
    case 'add':
      runAdd(cwd, rest[0]);
      break;
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

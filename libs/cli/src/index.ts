import { run } from './lib/run';

run(process.argv.slice(2)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

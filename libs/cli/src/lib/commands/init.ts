import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_CONFIG, configExists, writeConfig } from '../components-config';
import { detectPackageManager, installDependencies } from '../package-manager';

export function runInit(cwd: string): void {
  if (!existsSync(join(cwd, 'angular.json'))) {
    console.error('No angular.json found here -- run `zaytoon init` from the root of an Angular project.');
    process.exitCode = 1;
    return;
  }

  if (configExists(cwd)) {
    console.log('components.json already exists -- skipping.');
  } else {
    writeConfig(cwd, DEFAULT_CONFIG);
    console.log('Created components.json');
  }

  const packageManager = detectPackageManager(cwd);
  const deps = ['@zaytoon/tokens', '@zaytoon/theme', '@zaytoon/primitives', '@zaytoon/presets-aurora'];
  console.log(`Installing ${deps.join(', ')} (${packageManager})...`);
  installDependencies(cwd, packageManager, deps);

  console.log(`
Next: wire up the theme provider in your app config (e.g. src/app/app.config.ts):

  import { provideZaytoonUI } from '@zaytoon/theme';
  import { Aurora, provideAuroraIcons } from '@zaytoon/presets-aurora';

  export const appConfig: ApplicationConfig = {
    providers: [
      // ...your existing providers
      provideZaytoonUI({ preset: Aurora }),
      provideAuroraIcons(),
    ],
  };

Then run \`zaytoon add button\` to add your first component.
`);
}

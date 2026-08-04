import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_CONFIG, configExists, writeConfig } from '../components-config';
import { detectPackageManager, installDependencies } from '../package-manager';

export function runInit(cwd: string): void {
  if (!existsSync(join(cwd, 'angular.json'))) {
    console.error('No angular.json found here -- run `semiui init` from the root of an Angular project.');
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
  const deps = ['@semiui/tokens', '@semiui/theme', '@semiui/primitives', '@semiui/presets-semi'];
  console.log(`Installing ${deps.join(', ')} (${packageManager})...`);
  installDependencies(cwd, packageManager, deps);

  // @semiui/cli itself isn't a runtime dep -- installed as a devDependency so that after this
  // first `npx @semiui/cli init`, plain `npx semiui add <component>` resolves locally instead of
  // needing the scoped package name again (npx only resolves a bare command name like "semiui"
  // from a local node_modules/.bin, never by searching bin names on the registry).
  console.log(`Installing @semiui/cli as a dev dependency (${packageManager})...`);
  installDependencies(cwd, packageManager, ['@semiui/cli'], true);

  console.log(`
Next: wire up the theme provider in your app config (e.g. src/app/app.config.ts):

  import { provideSemiUI } from '@semiui/theme';
  import { Aurora, provideAuroraIcons } from '@semiui/presets-aurora';

  export const appConfig: ApplicationConfig = {
    providers: [
      // ...your existing providers
      provideSemiUI({ preset: Aurora }),
      provideAuroraIcons(),
    ],
  };

Then run \`semiui add button\` to add your first component.
`);
}

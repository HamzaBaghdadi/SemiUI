import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { DEFAULT_CONFIG, configExists, readConfig, writeConfig } from '../components-config';
import { detectPackageManager, installDependencies } from '../package-manager';

export type PresetName = 'semi' | 'aurora';

const PRESETS: Record<PresetName, { packageName: string; exportName: string; iconsFn: string }> = {
  semi: { packageName: '@semiui/presets-semi', exportName: 'Semi', iconsFn: 'provideSemiIcons' },
  aurora: { packageName: '@semiui/presets-aurora', exportName: 'Aurora', iconsFn: 'provideAuroraIcons' },
};

export interface InitOptions {
  preset?: PresetName;
}

function isPresetName(value: string | undefined): value is PresetName {
  return value === 'semi' || value === 'aurora';
}

/** Prompts on a real TTY; defaults to "semi" for non-interactive runs (CI, piped input, tests). */
async function promptForPreset(): Promise<PresetName> {
  if (!process.stdin.isTTY) {
    return 'semi';
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log('\nWhich preset would you like to start from?');
  console.log('  1) Semi (default)');
  console.log('  2) Aurora');

  const answer = await new Promise<string>((resolve) => rl.question('> ', resolve));
  rl.close();

  const trimmed = answer.trim().toLowerCase();
  return trimmed === '2' || trimmed === 'aurora' ? 'aurora' : 'semi';
}

export async function runInit(cwd: string, options: InitOptions = {}): Promise<void> {
  if (!existsSync(join(cwd, 'angular.json'))) {
    console.error('No angular.json found here -- run `semiui init` from the root of an Angular project.');
    process.exitCode = 1;
    return;
  }

  let preset: PresetName;
  if (configExists(cwd)) {
    console.log('components.json already exists -- skipping.');
    const existing = readConfig(cwd).preset;
    preset = isPresetName(existing) ? existing : 'semi';
  } else {
    preset = options.preset ?? (await promptForPreset());
    writeConfig(cwd, { ...DEFAULT_CONFIG, preset });
    console.log('Created components.json');
  }

  const { packageName, exportName, iconsFn } = PRESETS[preset];
  const packageManager = detectPackageManager(cwd);
  const deps = ['@semiui/tokens', '@semiui/theme', '@semiui/primitives', packageName];
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
  import { ${exportName}, ${iconsFn} } from '${packageName}';

  export const appConfig: ApplicationConfig = {
    providers: [
      // ...your existing providers
      provideSemiUI({ preset: ${exportName} }),
      ${iconsFn}(),
    ],
  };

Then run \`semiui add button\` to add your first component.
`);
}

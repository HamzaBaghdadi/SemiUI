import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readConfig } from '../components-config';
import { detectPackageManager, installDependencies } from '../package-manager';
import { getComponent, listComponents, readRecipeFile } from '../registry';

function pascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

export function runAdd(cwd: string, componentName: string | undefined): void {
  if (!componentName) {
    console.error('Usage: zaytoon add <component>\n\nAvailable components:');
    for (const component of listComponents()) {
      console.error(`  ${component.name} -- ${component.description}`);
    }
    process.exitCode = 1;
    return;
  }

  const component = getComponent(componentName);
  if (!component) {
    const available = listComponents()
      .map((c) => c.name)
      .join(', ');
    console.error(`Unknown component "${componentName}". Available: ${available}`);
    process.exitCode = 1;
    return;
  }

  const config = readConfig(cwd);
  const targetDir = join(cwd, config.componentsDir, component.name);
  mkdirSync(targetDir, { recursive: true });

  for (const file of component.files) {
    const destPath = join(targetDir, file);
    if (existsSync(destPath)) {
      console.log(`Skipping ${file} -- already exists at ${destPath} (it's yours now, not overwriting).`);
      continue;
    }
    writeFileSync(destPath, readRecipeFile(component.name, file), 'utf8');
    console.log(`Added ${destPath}`);
  }

  const packageManager = detectPackageManager(cwd);
  console.log(`Installing ${component.npmDependencies.join(', ')} (${packageManager})...`);
  installDependencies(cwd, packageManager, component.npmDependencies);

  if (component.icons?.length) {
    const iconImports = component.icons.join(', ');
    console.log(`
This component uses these icons from @ng-icons/lucide: ${iconImports}
Install @ng-icons/lucide and register them in your app config:

  import { provideIcons } from '@ng-icons/core';
  import { ${iconImports} } from '@ng-icons/lucide';

  export const appConfig: ApplicationConfig = {
    providers: [
      // ...
      provideIcons({ ${iconImports} }),
    ],
  };
`);
  }

  const className = `${pascalCase(component.name)}Component`;
  const modulePath = join(config.componentsDir, component.name, `${component.name}.component`);
  console.log(`\nDone. ${className} is now yours to edit at ${modulePath}.ts -- import it with a relative path from there.`);
}

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readConfig } from '../components-config';
import { detectPackageManager, installDependencies } from '../package-manager';
import { RegistryComponent, getComponent, listComponents, readRecipeFile, resolveWithDependencies } from '../registry';

export interface AddOptions {
  /** Installs every component in the registry instead of a single named one. */
  all?: boolean;
  /** Overrides `componentsDir` from components.json for this invocation only. */
  path?: string;
}

function pascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

/** Every registry component plus its recipe dependencies, deduplicated. */
function resolveAll(): RegistryComponent[] {
  const seen = new Set<string>();
  const resolved: RegistryComponent[] = [];
  for (const component of listComponents()) {
    for (const item of resolveWithDependencies(component.name)) {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        resolved.push(item);
      }
    }
  }
  return resolved;
}

export function runAdd(cwd: string, componentName: string | undefined, options: AddOptions = {}): void {
  if (!options.all && !componentName) {
    console.error('Usage: semiui add <component> | semiui add --all\n\nAvailable components:');
    for (const component of listComponents()) {
      console.error(`  ${component.name} -- ${component.description}`);
    }
    process.exitCode = 1;
    return;
  }

  let toInstall: RegistryComponent[];
  if (options.all) {
    toInstall = resolveAll();
    console.log(`Adding all ${toInstall.length} components...`);
  } else {
    const component = getComponent(componentName as string);
    if (!component) {
      const available = listComponents()
        .map((c) => c.name)
        .join(', ');
      console.error(`Unknown component "${componentName}". Available: ${available}`);
      process.exitCode = 1;
      return;
    }
    toInstall = resolveWithDependencies(componentName as string);
    const dependencyNames = toInstall.filter((c) => c.name !== componentName).map((c) => c.name);
    if (dependencyNames.length) {
      console.log(`${component.name} depends on: ${dependencyNames.join(', ')} -- adding those too.`);
    }
  }

  const config = readConfig(cwd);
  const componentsDir = options.path ?? config.componentsDir;

  for (const item of toInstall) {
    const targetDir = join(cwd, componentsDir, item.name);
    mkdirSync(targetDir, { recursive: true });

    for (const file of item.files) {
      const destPath = join(targetDir, file);
      if (existsSync(destPath)) {
        console.log(`Skipping ${file} -- already exists at ${destPath} (it's yours now, not overwriting).`);
        continue;
      }
      writeFileSync(destPath, readRecipeFile(item.name, file), 'utf8');
      console.log(`Added ${destPath}`);
    }
  }

  const npmDependencies = [...new Set(toInstall.flatMap((item) => item.npmDependencies))];
  if (npmDependencies.length) {
    const packageManager = detectPackageManager(cwd);
    console.log(`Installing ${npmDependencies.join(', ')} (${packageManager})...`);
    installDependencies(cwd, packageManager, npmDependencies);
  }

  const icons = [...new Set(toInstall.flatMap((item) => item.icons ?? []))];
  if (icons.length) {
    const iconImports = icons.join(', ');
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

  if (options.all) {
    console.log(`\nDone. ${toInstall.length} components are now yours to edit at ${componentsDir}.`);
  } else {
    const component = getComponent(componentName as string) as RegistryComponent;
    const className = `${pascalCase(component.name)}Component`;
    const modulePath = join(componentsDir, component.name, `${component.name}.component`);
    console.log(`\nDone. ${className} is now yours to edit at ${modulePath}.ts -- import it with a relative path from there.`);
  }
}

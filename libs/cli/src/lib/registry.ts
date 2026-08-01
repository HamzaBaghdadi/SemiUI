import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import registryData from './registry.json';

export interface RegistryComponent {
  name: string;
  description: string;
  files: string[];
  npmDependencies: string[];
  icons?: string[];
  /** Other registry components this one imports from (e.g. text-input uses error-message). */
  recipeDependencies?: string[];
}

const REGISTRY = registryData as Record<string, RegistryComponent>;

export function getComponent(name: string): RegistryComponent | undefined {
  return REGISTRY[name];
}

export function listComponents(): RegistryComponent[] {
  return Object.values(REGISTRY);
}

/** A component plus every recipe it depends on (recursively, deduplicated, dependencies first). */
export function resolveWithDependencies(name: string): RegistryComponent[] {
  const resolved: RegistryComponent[] = [];
  const seen = new Set<string>();

  function visit(componentName: string): void {
    if (seen.has(componentName)) {
      return;
    }
    seen.add(componentName);
    const component = getComponent(componentName);
    if (!component) {
      return;
    }
    for (const dep of component.recipeDependencies ?? []) {
      visit(dep);
    }
    resolved.push(component);
  }

  visit(name);
  return resolved;
}

/**
 * Directory containing the recipe source. At runtime this is `recipes/` copied alongside the
 * built CLI (dist/libs/cli/recipes). Running from source (tests, ts-node) that copy doesn't
 * exist, so fall back to the repo-root `recipes/` the build copies it from.
 */
function recipesRoot(): string {
  const bundled = join(__dirname, 'recipes');
  if (existsSync(bundled)) {
    return bundled;
  }
  return join(__dirname, '../../../../recipes');
}

export function readRecipeFile(componentName: string, fileName: string): string {
  const filePath = join(recipesRoot(), componentName, fileName);
  if (!existsSync(filePath)) {
    throw new Error(`Bundled recipe file not found: ${filePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

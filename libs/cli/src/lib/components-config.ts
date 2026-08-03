import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ComponentsConfig {
  preset: string;
  componentsDir: string;
  prefix: string;
}

export const DEFAULT_CONFIG: ComponentsConfig = {
  preset: 'aurora',
  componentsDir: 'src/app/components',
  prefix: 's',
};

function configPath(cwd: string): string {
  return join(cwd, 'components.json');
}

export function configExists(cwd: string): boolean {
  return existsSync(configPath(cwd));
}

export function readConfig(cwd: string): ComponentsConfig {
  if (!configExists(cwd)) {
    return DEFAULT_CONFIG;
  }
  return { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(configPath(cwd), 'utf8')) };
}

export function writeConfig(cwd: string, config: ComponentsConfig): void {
  writeFileSync(configPath(cwd), JSON.stringify(config, null, 2) + '\n', 'utf8');
}

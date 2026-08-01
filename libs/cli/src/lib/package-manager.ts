import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export type PackageManager = 'pnpm' | 'yarn' | 'npm';

export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

export function installDependencies(cwd: string, packageManager: PackageManager, packages: string[]): void {
  if (packages.length === 0) return;
  const args = packageManager === 'yarn' ? ['add', ...packages] : ['install', ...packages];
  execFileSync(packageManager, args, { cwd, stdio: 'inherit', shell: true });
}

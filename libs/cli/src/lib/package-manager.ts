import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export type PackageManager = 'pnpm' | 'yarn' | 'npm';

export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

export function installDependencies(
  cwd: string,
  packageManager: PackageManager,
  packages: string[],
  dev = false,
): void {
  if (packages.length === 0) return;
  const installWord = packageManager === 'yarn' ? 'add' : 'install';
  const args = dev ? [installWord, '-D', ...packages] : [installWord, ...packages];
  execFileSync(packageManager, args, { cwd, stdio: 'inherit', shell: true });
}

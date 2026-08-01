#!/usr/bin/env node
// Manual publish script: run this yourself after merging a "Version Packages" PR
// (see .github/workflows/release.yml -- CI only opens that PR, it never publishes,
// so you enter the npm OTP yourself, right here, each time).
//
// `changeset version` bumps versions in each lib's *source* package.json (libs/tokens,
// libs/theme, ...), since that's what pnpm-workspace.yaml lists as the workspace packages --
// that's also where the changelog gets written, so it shows up in the "Version Packages" PR.
//
// But `npm publish` always publishes whatever directory its package.json lives in, and our
// source directories contain raw TypeScript plus dev config (eslint, tsconfig, project.json),
// not the built output. There's no npm equivalent of Yarn's `publishConfig.directory` to redirect
// that. So this script: rebuilds each package fresh (picking up the version `changeset version`
// just bumped, since ng-packagr/tsc copy it into the dist manifest), then runs `npm publish`
// from each dist/ output directly -- interactively, so npm's OTP prompt reaches your terminal.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PACKAGES = [
  { project: 'tokens', dir: 'libs/tokens', dist: 'dist/libs/tokens' },
  { project: 'theme', dir: 'libs/theme', dist: 'dist/libs/theme' },
  { project: 'primitives', dir: 'libs/primitives', dist: 'dist/libs/primitives' },
  { project: 'presets-aurora', dir: 'libs/presets/aurora', dist: 'dist/libs/presets/aurora' },
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function isAlreadyPublished(name, version) {
  try {
    execFileSync('npm', ['view', `${name}@${version}`, 'version'], { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

console.log('Building all packages so dist/ picks up the versions changeset just bumped...');
execFileSync('npx', ['nx', 'run-many', '-t', 'build', '-p', PACKAGES.map((p) => p.project).join(',')], {
  stdio: 'inherit',
  shell: true,
});

for (const { dir, dist } of PACKAGES) {
  const srcPkg = readJson(`${dir}/package.json`);
  const distPkg = readJson(`${dist}/package.json`);

  if (distPkg.version !== srcPkg.version) {
    throw new Error(
      `${dist}/package.json version (${distPkg.version}) doesn't match ${dir}/package.json (${srcPkg.version}) after rebuild -- aborting publish.`,
    );
  }

  if (isAlreadyPublished(srcPkg.name, srcPkg.version)) {
    console.log(`Skipping ${srcPkg.name}@${srcPkg.version} -- already published.`);
    continue;
  }

  // --provenance requires GitHub Actions/GitLab CI's OIDC context; it errors out if run locally.
  const publishArgs = ['publish', '--access', 'public'];
  if (process.env.GITHUB_ACTIONS === 'true') {
    publishArgs.push('--provenance');
  }

  console.log(`Publishing ${srcPkg.name}@${srcPkg.version} from ${dist}...`);
  execFileSync('npm', publishArgs, { cwd: dist, stdio: 'inherit', shell: true });
}

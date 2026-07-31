# Atlas UI — Execution Plan: Init → Codebase → Published on npm

Companion to `angular-ui-library-plan.md` (the strategy doc). That one answers "what and why." This one answers "what do I actually type, in what order, to get a real package on npm." Follow it top to bottom — each phase assumes the previous one is done and committed.

---

## Phase 0 — Accounts & reservations (do this before writing any code)

Names get squatted fast once a project like this becomes public, so lock these down first:

- [ ] Pick your real package scope (replace `zaytoon` everywhere below). Check availability:
  ```bash
  npm view @zaytoon/theme   # should 404 if the scope/name is free
  ```
- [ ] Create an npm account if you don't have one, then create the npm **organization** matching your scope (npmjs.com → Add Organization). Scoped packages under an org can be published as public for free — you just need `publishConfig.access: "public"` on each package (Phase 3).
- [ ] Reserve the GitHub org/repo name to match.
- [ ] `npm login` locally and confirm: `npm whoami`.

---

## Phase 1 — Workspace bootstrap

```bash
npx create-nx-workspace@latest zaytoon \
  --preset=angular-standalone \
  --style=css \
  --package-manager=pnpm \
  --ci=github

cd zaytoon
git branch -M main
git remote add origin git@github.com:<you>/zaytoon.git
git add -A && git commit -m "chore: initial workspace"
git push -u origin main
```

**Push a public repo now, even nearly empty.** This is deliberate, not optional — early visibility is how you start attracting eyes and contributors while you build (see the strategy doc's OSS-growth section), and there's no cost to doing it on day one versus waiting for a "finished enough" moment that never quite arrives.

Add a real README, MIT `LICENSE` file, and `CONTRIBUTING.md` stub in this same commit — a repo with no README is a repo nobody stars.

---

## Phase 2 — Library scaffolding

Three of your five packages are pure TypeScript (no Angular dependency) or Angular libraries — use the matching generator for each so ng-packagr only runs where it's actually needed:

```bash
# Pure TS, framework-agnostic
npx nx g @nx/js:library tokens --directory=libs/tokens --bundler=none --publishable --importPath=@zaytoon/tokens

# Angular libraries (ng-packagr under the hood via Nx)
npx nx g @nx/angular:library theme      --directory=libs/theme      --publishable --importPath=@zaytoon/theme
npx nx g @nx/angular:library primitives --directory=libs/primitives --publishable --importPath=@zaytoon/primitives
npx nx g @nx/angular:library presets/aurora --directory=libs/presets/aurora --publishable --importPath=@zaytoon/presets/aurora

# CLI — plain Node package, not Angular
npx nx g @nx/js:library cli --directory=libs/cli --bundler=esbuild --publishable --importPath=@zaytoon/cli
```

Drop the theme-engine files from the last message straight into `libs/theme/src/lib/` and `libs/presets/aurora/src/lib/`, wire up the barrel `index.ts` files, and confirm it builds:

```bash
npx nx build theme
npx nx build presets-aurora
```

### `primitives` needs one secondary entry point per component
This is what lets users (and your own recipe components) `import { SelectPrimitive } from '@zaytoon/primitives/select'` instead of pulling in every component's behavior at once:

```bash
npx nx g @nx/angular:library primitives/button --directory=libs/primitives/button --publishable --importPath=@zaytoon/primitives/button
npx nx g @nx/angular:library primitives/select --directory=libs/primitives/select --publishable --importPath=@zaytoon/primitives/select
# ...one per component, added as you build each one — don't pre-generate all 15 now
```

---

## Phase 3 — package.json correctness (the part that actually blocks a real publish)

Each publishable lib's generated `libs/<name>/package.json` needs these fields checked/set — this is the single most common reason a first npm publish fails or ships broken:

```jsonc
{
  "name": "@zaytoon/theme",
  "version": "0.0.1",
  "publishConfig": { "access": "public" },   // required for a free scoped package
  "peerDependencies": {
    "@angular/core": ">=22.0.0",
    "@angular/common": ">=22.0.0"
  },
  "sideEffects": false
}
```

For `@zaytoon/primitives`, also confirm `@angular/aria` and `@angular/cdk` are listed as **peerDependencies**, not regular dependencies — you don't want to force a version of Angular CDK/Aria on consumers that conflicts with the rest of their app.

---

## Phase 4 — Build the first real primitive (prove the architecture with one component before scaling)

Pick **Button** first — simplest possible primitive, but still exercises the whole pipeline end to end:

```
libs/primitives/button/src/lib/button.directive.ts   # behavior: disabled state, press/click handling
recipes/button/button.component.ts                    # the copied, styled recipe — consumes the primitive + theme tokens
recipes/button/button.component.html
```

Wire `recipes/button` to read CSS custom properties from the theme engine (`var(--atlas-comp-button-padding-x)` etc.) rather than hardcoded values — this is what makes the preset system actually control the recipe's appearance.

**Manual smoke test before moving on:**
```bash
npx nx g @nx/angular:application example
```
Add `provideAtlasUI({ preset: Aurora })` to `apps/example/src/app/app.config.ts`, drop the Button recipe into a page, run `npx nx serve example`, and confirm the theme tokens are actually reaching the rendered button. **Do not build component #2 until this loop works** — everything else is a repeat of this same pattern.

---

## Phase 5 — Testing gates

```bash
npx nx g @nx/vitest:configuration --project=primitives-button
pnpm add -D -w @axe-core/playwright playwright
```

- Unit test the button primitive's behavior (disabled state blocks clicks, keyboard Enter/Space triggers press) — not its visual output.
- Add one Playwright + axe-core smoke test against the example app's button page, run in both `dir="ltr"` and `dir="rtl"`.
- Wire both into `nx affected -t test` so CI only runs what changed.

---

## Phase 6 — Versioning & changelogs (Changesets)

```bash
pnpm add -D -w @changesets/cli @changesets/changelog-github
npx changeset init
```

Edit `.changeset/config.json`:
```jsonc
{
  "changelog": ["@changesets/changelog-github", { "repo": "<you>/zaytoon" }],
  "access": "public",
  "baseBranch": "main"
}
```

Every meaningful PR should add a changeset:
```bash
npx changeset
# interactive: pick which packages changed, patch/minor/major, write a one-line summary
```

---

## Phase 7 — CI: build/test on every PR

`.github/workflows/ci.yml`:
```yaml
name: CI
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: npx nx affected -t lint test build --base=origin/main
```

---

## Phase 8 — CI: automated release to npm

Generate an npm **Automation token** (npmjs.com → Access Tokens → Granular, "Automation" type so it bypasses 2FA prompts in CI) and add it as `NPM_TOKEN` in GitHub repo secrets.

`.github/workflows/release.yml`:
```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write        # needed for npm provenance
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm', registry-url: 'https://registry.npmjs.org' }
      - run: pnpm install --frozen-lockfile
      - run: npx nx run-many -t build
      - uses: changesets/action@v1
        with:
          publish: npx changeset publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What this gives you:** merging a PR with pending changesets opens an auto-generated "Version Packages" PR (bumps versions, writes changelogs). Merging *that* PR triggers the actual `npm publish` with `--provenance`, so consumers can verify the package was built from this exact repo/commit — worth having from day one, it's a trust signal for an unknown new library.

---

## Phase 9 — First manual publish (do this once, by hand, before trusting CI with it)

```bash
npx nx build theme
cd dist/libs/theme
npm publish --dry-run          # inspect exactly what would be uploaded
npm publish --access public    # the real first publish, only after the dry-run looks right
```

Check on npmjs.com afterward: correct `README` rendering, correct `files`/`exports` in `package.json` (no `src/` leaking into the published tarball, no missing `.d.ts` files). Fix packaging issues **before** wiring CI to auto-publish — a broken automated publish is much more annoying to unwind than a broken manual one.

---

## Phase 10 — The CLI package

`libs/cli` ships as a normal npm package with a `bin` entry:
```jsonc
// libs/cli/package.json
{
  "name": "zaytoon",              // unscoped is fine/better here — this is what people type after npx
  "bin": { "zaytoon": "./index.js" }
}
```

Minimum viable `init`/`add` for launch:
- `init` — writes `components.json`, adds the Tailwind preset (if used) and the theme provider snippet to `app.config.ts` (via a simple AST edit with `ts-morph`, or just print instructions if you want to keep v1 simple).
- `add <component>` — copies the recipe's files from a **published registry** (a JSON manifest hosted alongside your docs site, listing each recipe's files + which primitive entry points it needs — same idea as shadcn's `registry.json`), writes the version/hash header from the earlier design, and runs `npm install` for any new primitive entry points.
- Defer `diff`/`migrate` (the 3-way merge system) to right after launch, once real users have real customized components to migrate — building it against zero real-world edits risks solving the wrong problem.

---

## Phase 11 — Docs site + first real components

Only after Phase 4–5's loop is proven:
- Scaffold the Analog docs app, deploy to Vercel/Netlify from day one (even with 1 component documented) — same "ship visible early" logic as Phase 1.
- Work through the Phase-1 component list from the strategy doc, one at a time, each following the exact Button loop: primitive → recipe → theme tokens wired → unit test → a11y test → docs page → changeset → merge.

---

## Phase 12 — Launch checklist

- [ ] All Phase-1 components published, each with a passing a11y + RTL test.
- [ ] `npx zaytoon init && npx zaytoon add button` works against a brand-new Angular 22 app, start to finish, on a machine that's never seen this repo.
- [ ] README leads with the differentiator (provider-based theming + copy-paste ownership), not a generic feature list.
- [ ] GitHub Sponsors / Open Collective live.
- [ ] Launch post written for the PrimeNG-displaced audience specifically.

---

### The one rule that matters most across all twelve phases
Don't parallelize before Phase 4's single-component loop is proven end to end — the theming pipeline, the packaging config, and the CI publish flow are each things you want to debug once, on the simplest possible component, rather than debug simultaneously across ten half-built ones.

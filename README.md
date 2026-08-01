# Zaytoon

An Angular UI library built on two ideas:

- **Provider-based theming** — one `provideZaytoonUI({ preset })` call wires up a full design-token system (light/dark mode included) via CSS custom properties, no build-step or Sass required.
- **Copy-paste ownership** — components aren't a black-box `node_modules` dependency. `npx zaytoon add button` copies the actual component source into your project, so you can edit it freely.

## Quick start

In an existing Angular 22 app:

```sh
npx zaytoon init
npx zaytoon add button
```

`init` installs the theming engine (`@zaytoon/tokens`, `@zaytoon/theme`, `@zaytoon/primitives`, `@zaytoon/presets-aurora`) and prints the two lines you add to `app.config.ts`:

```ts
import { provideZaytoonUI } from '@zaytoon/theme';
import { Aurora, provideAuroraIcons } from '@zaytoon/presets-aurora';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...your existing providers
    provideZaytoonUI({ preset: Aurora }),
    provideAuroraIcons(),
  ],
};
```

`add <component>` copies that component's source into `src/app/components/<name>/` and installs whatever it needs. Currently available: `button`, `text-input`, `password`.

Light/dark mode comes free — inject `ColorModeService` from `@zaytoon/theme` anywhere and call `.toggle()`.

## Packages

| Package | What it is |
| --- | --- |
| [`@zaytoon/tokens`](libs/tokens) | Framework-agnostic design token contract + the `flattenTokensToCssVars` utility. No Angular dependency. |
| [`@zaytoon/theme`](libs/theme) | `provideZaytoonUI()`, `ColorModeService`, and the CSS-stylesheet injection that makes light/dark mode work. |
| [`@zaytoon/primitives`](libs/primitives) | Unstyled behavior: `ButtonDirective`, `InputDirective`, `ZIconComponent`, `BaseFormFieldControl` (the shared `ControlValueAccessor` + Angular Signal Forms plumbing every form component builds on). |
| [`@zaytoon/presets-aurora`](libs/presets/aurora) | The default preset: a full light + dark color palette and component tokens. |
| [`zaytoon`](libs/cli) | The CLI (`init` / `add`). |

Recipes — the actual styled components (`Button`, `TextInput`, `Password`) — live in [`recipes/`](recipes) and are deliberately **not** published to npm; the CLI copies them into consumer projects instead.

## Repo layout

```
libs/            Publishable packages (tokens, theme, primitives, presets/aurora, cli)
recipes/         Component source the CLI copies into consumer projects
apps/example/    Local proving ground -- every recipe change gets exercised here first
apps/docs/       Docs site (plain Angular, no SSR)
```

## Development

```sh
pnpm install
npx nx run-many -t build test lint      # everything
npx nx serve example                     # local playground
npx nx serve docs                        # docs site
```

Every meaningful change should add a changeset:

```sh
npx changeset
```

See [`npm-launch-execution-plan.md`](npm-launch-execution-plan.md) for the full release process, and [`scripts/publish-packages.mjs`](scripts/publish-packages.mjs) for how manual publishing works (npm OTP entered by hand, on purpose -- no CI automation token).

## License

MIT

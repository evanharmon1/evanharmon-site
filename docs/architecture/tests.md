# Tests

How testing works in Evan Harmon Website.

## Layers

| Layer | Tool | Command |
|---|---|---|
| Lint / static analysis | shellcheck, yamllint, markdownlint, actionlint, eslint, prettier, tsc/astro check | `task check` |
| Unit / component tests | vitest | `task test` |
| End-to-end | Playwright | `task test:e2e` |
| Accessibility | axe-core (via Playwright) | `task test:a11y` |
| Application security | Semgrep CE locally; CodeQL in eligible CI | `task security:sast` |
| Optional second opinion | Snyk Code + Open Source, manual | `task security:sast:snyk` / `task security:sca:snyk` |
| Secrets | gitleaks | `task security:secrets` |
| Dependencies | package-manager audit | `task security:audit` |

## The tier boundary: port-free vs. port-binding

The split that matters most for agents and parallel worktrees is **whether a
tier binds a port**, not what it is named:

| Tier | Binds a port? | Where it runs |
|---|---|---|
| `task check` (lint, format check, typecheck) | no | inner loop, editors, git hooks |
| `task build` | no — writes `dist/`, does not serve | `verify`, CI `build-test` |
| `task test` (vitest) | no | `verify`, CI `build-test` |
| `task verify` (= check + build + test) | **no** | the agent's definition-of-done gate |
| `task test:e2e` (Playwright) | **yes** — serves the app | `task ci`, CI `e2e` job |
| Lighthouse | **yes** — serves + headless Chrome | CI `lighthouse` job only |

Everything an agent runs on every change is port-free, so N agents in N
worktrees can run `task verify` concurrently without fighting over a port.
`task test:e2e` is the first tier that serves the app, which is why it lives in
`task ci` (on demand when CI is red, one at a time) and in its own CI job
(runner-isolated) — never in `check`, `test`, or `verify`.

**Do not "fix" a slow inner loop by moving e2e into `verify`, and do not add a
port-binding step to `check`/`build`/`test`.** That is the invariant this split
exists to protect.

## Build ↔ e2e contract

`task test:e2e` **never builds**. Ownership is split instead:

- **In `task ci`** — ordering provides `dist/`: `ci` runs `verify` (which runs
  `build`) before `test:e2e`. Same in CI, where the `e2e` job runs `task build`
  itself.
- **Running it directly** — the app's `playwright.config.ts` `webServer` owns
  serving (e.g. `vite preview` with `reuseExistingServer: true`, or a dev
  server). Configure it to build or serve whatever that app needs.

There is deliberately **no `deps: [build]` and no `sources:`/`generates:`
fingerprinting** on these tasks. Task's file-based caching has been a recurring
source of stale-output bugs here; the explicit ordering above is cheaper to
reason about, and duplicate builds are the acceptable cost.

`task test:e2e` skips cleanly until the app ships a `playwright.config.*`, so a
fresh scaffold keeps `task ci` and the `e2e` check green. That skip covers
**only** the missing-config case — once a config exists,
`scripts/e2e-env-guard.sh` runs and **fails until it is configured** for this
app's providers and production domains (fail-closed by design; see
`docs/CHECKLIST.md`). Never widen the skip to swallow an unconfigured guard.

Two more things `task test:e2e` does, both to stay honest about the tiers:

- It runs with `--grep-invert @a11y --pass-with-no-tests`. The `@a11y` specs are
  their own **non-blocking** tier (`task test:a11y`, and a CI job deliberately
  kept out of `verify.needs`); running them unfiltered inside the blocking `e2e`
  check would promote accessibility to a required gate through the back door.
  `--pass-with-no-tests` is what makes that filter safe: `docs/CHECKLIST.md`
  tells you to add a `playwright.config.*` purely to switch the a11y job on, and
  at that point the shipped `tests/a11y.spec.ts` is the only spec — without it,
  Playwright would error on "no tests found" and wedge a required check.
- It installs browsers (like the CI job) **unless** `PLAYWRIGHT_BROWSERS_PATH`
  points at a read-only, image-owned cache. The devcontainer bakes **chromium
  only** into a root-owned `/ms-playwright` — the Dockerfile is deliberately
  profile-invariant, so shipping every browser would bloat the image for repo
  types that never run e2e. Installing from inside a task there fails with
  `EACCES`, so if your config declares Firefox/WebKit projects, add them to
  `.devcontainer/Dockerfile` and rebuild, or point `PLAYWRIGHT_BROWSERS_PATH`
  at a writable directory. The task prints both options rather than failing
  obscurely.
## Conventions

- Test files live in `tests/` at the repo root (or co-located per framework convention).
- `task verify` is the local definition-of-done gate; `task ci` adds the
  port-binding e2e tier and security, on demand when CI is red. CI runs the same task targets.
- Playwright runs desktop Chromium/Firefox/WebKit **and mobile device
  projects** (e.g. Pixel + iPhone). The scaffold ships the mobile projects
  commented out — enable them; mobile-first is the convention.
- Accessibility: axe-core assertions live in Playwright specs tagged `@a11y`
  (run via `task test:a11y`). This is the automated **floor** (WCAG 2.x A/AA
  rules axe can detect) — keyboard + screen-reader testing still required.
- TODO: document coverage expectations and fixtures as the suite grows.

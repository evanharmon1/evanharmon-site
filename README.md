# Evan Harmon Website

My personal website — **"The Almanac"** — built with Astro, Tailwind CSS, and
TypeScript, and standardized with
[harmon-init](https://github.com/evanharmon1/harmon-init) (harmon-platform).

<https://evanharmon.com>

[![Build & Validate](https://github.com/evanharmon1/evanharmon-site/actions/workflows/build.yml/badge.svg)](https://github.com/evanharmon1/evanharmon-site/actions/workflows/build.yml)
[![CodeQL](https://github.com/evanharmon1/evanharmon-site/actions/workflows/codeql.yml/badge.svg)](https://github.com/evanharmon1/evanharmon-site/actions/workflows/codeql.yml)
[![Devcontainer Build](https://github.com/evanharmon1/evanharmon-site/actions/workflows/devcontainer-build.yml/badge.svg)](https://github.com/evanharmon1/evanharmon-site/actions/workflows/devcontainer-build.yml)
[![Clone in Local Dev Container](https://img.shields.io/static/v1?label=Local%20Dev%20Container&message=Clone&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode%3A//ms-vscode-remote.remote-containers/cloneInVolume%3Furl%3Dhttps%3A//github.com/evanharmon1/evanharmon-site)
[![Latest Release](https://img.shields.io/github/v/release/evanharmon1/evanharmon-site?sort=semver)](https://github.com/evanharmon1/evanharmon-site/releases)
[![Renovate](https://img.shields.io/badge/maintained%20with-renovate-blue?logo=renovatebot)](https://github.com/apps/renovate)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Copier](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/copier-org/copier/master/img/badge/badge-grayscale-inverted-border-orange.json)](https://github.com/copier-org/copier)

```bash
task bootstrap   # one-time machine setup (Homebrew + Node + pnpm)
task install     # Brewfile deps + pnpm install + lefthook git hooks
task verify      # confirm everything passes
```

Or open the repo in the devcontainer (VS Code "Reopen in Container", or a
[Coder](https://coder.com) workspace) — the human profile lives in
`.devcontainer/dev/`, the AI/bot profile at `.devcontainer/`.

New here? Start with [docs/guides/onboarding.md](docs/guides/onboarding.md) and the
post-generation [docs/CHECKLIST.md](docs/CHECKLIST.md).

## Tech Stack

- **Astro** (static output) + **Tailwind CSS v4** (CSS-first) + **TypeScript**
- **React + shadcn/ui** for interactive islands
- **pnpm** package manager
- Design system in [DESIGN.md](./DESIGN.md); runtime tokens in `src/styles/globals.css`

## Deployment

Static site deployed via [`netlify.toml`](./netlify.toml) (publishes `dist/`,
builds with `pnpm build`). GitHub Actions in
[`.github/workflows/`](./.github/workflows/) run build, lint, security, and
CodeQL checks.

## Project Structure

```text
.
├── .claude/             # Claude Code settings + skills
├── .devcontainer/       # Dual-profile devcontainer (AI bot + dev/ human)
├── .github/             # Workflows, templates, CODEOWNERS, branch ruleset
├── docs/                # Documentation (see docs/README.md)
├── scripts/             # Repo utility scripts (hygiene, status, summaries)
├── specs/               # Specifications
├── tests/               # Tests
├── AGENTS.md            # AI agent guidance (CLAUDE.md/GEMINI.md symlink here)
├── DESIGN.md            # Design / UX intent (AI-facing)
├── Taskfile.yml         # Task runner — single source of truth for commands
├── lefthook.yml         # Git hooks (delegate to Taskfile tasks)
└── todo.md              # Scratch todos (gitignored)
```

## Commands

`task` (or `task menu`) shows the interactive picker. Key targets:

| Command | What it does |
|---|---|
| `task check` | Fast gate: all linters + typecheck, in parallel |
| `task verify` | Definition-of-done gate: check + build + validate + tests |
| `task fix` | Auto-format, then lint |
| `task dev` | Dev server with hot reload |
| `task build` | Production build |
| `task test` | Run tests (see [docs/architecture/tests.md](docs/architecture/tests.md)) |
| `task security` | Free local baseline: Semgrep CE + gitleaks + dependency audit |
| `task security:sast` / `security:sca` | Semgrep CE / package-manager dependency audit |
| `task security:sast:snyk` / `security:sca:snyk` | Optional Snyk second-opinion scans (manual or explicitly scheduled) |
| `task challenge` / `task review` | Codex second-model reviews: adversarial / verification checkpoint (advisory, local-only) |
| `task codex:gate:enable` | Automatic Claude → Codex stop-gate for this repo + machine (also `:disable` / `:status`) |
| `task release:patch` | Tag + GitHub release (also `:minor` / `:major`) |
| `task status` | Project status dashboard (also `status:git`/`:gh`/`:creds`/`:code`/`:env`) |
| `task status:creds` | Credential logins (gh, Codex, Claude Code) + the gh token's scopes — local probes plus one bounded 3s scope check (`STATUS_NO_NETWORK=1` skips it); also run at session start |
| `task status:setup` | Setup audit: local credentials, GitHub config, toolchain, devcontainer, dev env |

## Testing

See [docs/architecture/tests.md](docs/architecture/tests.md). Tests live in `tests/`; CI runs the
same `task` targets as local hooks.

## CI/CD

| Workflow | Purpose |
|---|---|
| `build.yml` | lint, build-test, e2e, lighthouse, security → aggregate `verify` gate |
| `codeql.yml` | CodeQL SAST: automatic and free for public repos; private/internal repos require GitHub Code Security + `FULL_SECURITY_SCAN=true` |
| `snyk-scheduled.yml` | Optional weekly Snyk SAST/SCA second opinion; advisory and never a required PR check |
| `devcontainer-build.yml` | Prebuilds devcontainer images to GHCR on merge to main |
| `claude-plan/implement/review.yml` | Mention-only: an `@claude` mention naming `plan`/`implement`/`review` from an authorized sender; each run holds `claim:claude` |
| `release.yml` | release-please maintains a release PR; merging it cuts the release |

Branch protection: `main` requires a PR with code-owner approval and the
`verify` + `security` + `codeql-verify` checks (importable ruleset in `.github/`; see
[docs/architecture/branch-protection.md](docs/architecture/branch-protection.md)).
**Releases are intentional** — release-please keeps a rolling release PR from
conventional commits; merging it cuts the tag, GitHub release, and CHANGELOG.
Nothing auto-releases on a normal merge. `task release:*` stays as a manual
override.

## Documentation

- [docs/README.md](./docs/README.md) — documentation map
- [docs/architecture/README.md](./docs/architecture/README.md) — architecture
- [DESIGN.md](./DESIGN.md) — design & UX intent

## License

See [LICENSE](LICENSE).

# Post-Generation Checklist — Evan Harmon Website

<!--
AI AGENTS: This checklist is a human-maintained record for humans to check off.
Do not check, uncheck, rewrite, remove, reorder, normalize, reconcile, or
otherwise update its items based on repository state. Do not try to keep it
consistent with code, configuration, tags, releases, or external services.
Read-only inspection and reporting are allowed when requested, but never mutate
checklist state based on the findings. Only edit a checklist item when the human
user clearly and explicitly asks for that specific checklist update.
-->

Work through this after generating the repo from harmon-init. Delete items
that don't apply, then keep this file as a record of what was configured.

Run **`task status:setup`** at any point to audit setup completeness — local
credentials (gh, Codex), GitHub config, toolchain, devcontainer, and dev
environment — against the items below
(✓ done · ✗ missing · ? unknown · – n/a).

## 1. Local setup

- [x] `task install` — Brewfile deps, `pnpm install`, and lefthook git hooks
- [x] `task verify` passes locally
- [x] **Vendor shared agent skills**: `.skills-sync.yaml` pins which harmon-devkit
      skill categories this repo gets (from your `skill_categories` answer). Set
      `ref` to the latest
      [harmon-devkit release](https://github.com/evanharmon1/harmon-devkit/releases)
      that ships the skill category layout, run `task sync:skills`, and commit
      `.claude/skills/`. Until then the `verify:skills*` drift checks skip
      cleanly (CI + pre-push). **Pin bumps are a two-step:** edit `ref` in
      `.skills-sync.yaml`, then run `task sync:skills` and commit the refreshed
      `.claude/skills/` in the same PR. Renovate surfaces a new release in the
      Dependency Dashboard; approve it there to open the pin PR, then run the
      sync and push its output as a separate commit (do not amend Renovate's
      commit). Renovate cannot do the re-sync, so a ref-only commit fails the
      drift check.
- [ ] Verify `evanharmon-site.code-workspace` opens the repo's folder in VS Code and has a unique VS Code Workspace color. Then add any other related repos (e.g. other org repos) to the `folders` list in the workspace file so you have quick access to those repos
- [ ] Extend `.gitignore` for your stack — the template ships a base; add stack-specific entries via [gitignore.io](https://www.toptal.com/developers/gitignore)
- [ ] macOS: add a Raycast quicklink/alias that opens the `evanharmon-site.code-workspace`
- [ ] macOS (Bunch): scaffold the launcher with `task util:bunch-add` (if not generated at copier time), then `task util:bunch-install` to move it to iCloud and leave a `.meta/*.bunch` symlink (re-run install if missing)

## 2. GitHub repo settings

- [x] **Automated settings** — run `task setup:github` (idempotent, safe to
      re-run): enables **Dependabot alerts** and **private vulnerability
      reporting** when public. Do not add `dependabot.yml`: Renovate owns routine
      and vulnerability-remediation PRs; Dependabot owns advisory alerts.
- [ ] **Bot PAT** — the agent's `GH_TOKEN`. If a fine-grained PAT already covers
`evanharmon1`,
      just add this repo to its **selected repositories**; a token is scoped to one
      resource owner, so a **new owner needs a new PAT**. Both layers are required —
      the collaborator grant above sets the ceiling, the PAT's repo list reaches it.
      Procedure: [guides/bot-account.md](guides/bot-account.md).
- [x] Import the branch ruleset (see [architecture/branch-protection.md](architecture/branch-protection.md)) — do this once `build.yml` and `codeql.yml` are on `main` so the required `verify`/`security`/`codeql-verify` checks resolve. **Use the UI import:** Settings → Rules → Rulesets → **New ruleset ▸ Import a ruleset** → select `.github/Branch Protection Ruleset - Protect Main.json`. (Prefer the UI over `gh api … rulesets`: the API `POST` is not idempotent — re-running creates a duplicate ruleset — and currently rejects the `merge_queue` rule. To later change the ruleset, edit the existing one in the UI rather than re-importing.)

- [x] Install the [Renovate app](https://github.com/apps/renovate) on the repo
- [-] Install the [CodeRabbit app](https://github.com/apps/coderabbitai) on the repo (`.coderabbit.yaml` is pre-configured)
- [x] Actions secret: `CLAUDE_CODE_OAUTH_TOKEN` (claude-* workflows) — generate
      with `claude setup-token`; the value must start **`sk-ant-oat01-`** (an OAuth
      token, billed to your Claude subscription), **not** `sk-ant-api03-` (a raw API
      key, billed at pay-as-you-go API rates). Then `gh secret set CLAUDE_CODE_OAUTH_TOKEN`
- [ ] **Foreman operator setup** — provision the separate READ-ONLY PAT that
      foreman hands to dispatched agents: export/store it as
      `FOREMAN_AGENT_GH_TOKEN` where the bot devcontainer's `init-env.sh` can
      inject it (1Password → devcontainer.env). Run `task setup:github-labels`
      so the `foreman:*` arming labels exist. Import the two tag rulesets
      (`.github/Tag Protection Ruleset - Version Tag Creation.json` /
      `… Immutability.json`, same UI import as the branch ruleset), then add
      the CI GitHub App to the **Creation** ruleset's bypass list (`always`) —
      release-please tags via that App, and bypass-actor App IDs are
      per-installation so the JSON cannot ship them. (Immutability keeps an
      empty bypass list on purpose: a moved `v*` tag is code execution in
      every consumer, so nobody bypasses it.) Create the standing probe tag on
      an **orphan commit**, so it is reachable from no branch:
      `git tag v0.0.0-probe "$(git commit-tree "$(git hash-object -t tree /dev/null)" -m 'foreman tag-immutability probe target (orphan; keep unreachable from any branch)')" && git push origin v0.0.0-probe`.
      Do not tag `HEAD` or any commit on `main`: `git describe` considers only
      tags reachable from `HEAD` and prefers the nearest, so a probe tag on a
      release commit outranks the release tag, and everything deriving a
      version from `git describe` — release tooling, image tags, package
      builds — then reports `0.0.0-probe` instead of the release. The probe
      only needs the remote tag's sha to differ from `main`'s, so an orphan
      target satisfies it permanently. Preflight
      empirically asserts `v*` tags are immutable and fails until both
      rulesets and the tag exist. Then `task foreman:preflight` (inside the
      bot devcontainer — foreman refuses to start anywhere else) to assert
      the security controls before any dispatch.
- [ ] **[human-only] Foreman reviewer-gate check** — `.foreman.toml`'s
      `[reviewer]` table is foreman's current-head review gate for the PRs it
      shepherds. Before the first dispatch (and again after any Foreman bump),
      confirm the configured `login` still matches the live Codex connector
      identity (actor ID `199175422`), that its terminal results — an APPROVED
      review at the head, or a 👍 from that login on foreman's own request
      comment — still mean what the readiness gate assumes, and that required
      checks run on draft PRs (foreman promotes only after they conclude).
- [x] **SAST coverage** — public repositories run CodeQL automatically and for
      free for the selected `codeql_languages`; confirm a successful upload in
      the Security tab. Free private repos
      run Semgrep CE in `build.yml`. Only set `FULL_SECURITY_SCAN=true` on a
      private/internal repository after enabling paid GitHub Code Security; the
      variable is a run switch, not an entitlement. It cannot disable public
      CodeQL.
- [x] **Choose the Snyk posture** — the default is manual/local only via
      `task security:sast:snyk` and `task security:sca:snyk`; it is not part of
      `task security` or required PR CI. Free private-repository tests share the
      Snyk Organization's monthly quota, including local CLI tests. Leave the
      Snyk GitHub App off unless deliberately adopting its PR integration; its
      checks are not required by the default branch ruleset.
- [-] **Optional scheduled Snyk** — leave this off for ordinary and free private
      repos. For a selected important public repo, re-render with
      `snyk_scan_schedule=weekly` (conservative) or `daily` (public or accepted
      unlimited OSS), set the generated workflow's `SNYK_TOKEN` Actions secret,
      and verify one manual run. Confirm Snyk classifies the public Git remote
      correctly. The workflow is advisory and never a required PR check.
- [x] **Create** the CI GitHub App `evanharmon1-ci` by hand (one App per org;
      **Settings → Developer settings → GitHub Apps**), or reuse the org's existing one.
- [x] **Install** the App on this repo — **Install App → Only select repositories**
      (the harmon-init repos that run release-please / claude-* / project-automation),
      **not "All"**. **Creating the App is not enough:** an App whose credentials are
      set but which is *not installed* on the repo makes
      `actions/create-github-app-token` fail at runtime with a **404**
      (`Not Found` — "not installed on this repository"). This is the single
      easiest step to miss.
- [x] Set `CI_APP_CLIENT_ID` (Actions **variable**) + `CI_APP_PRIVATE_KEY` (Actions
      **secret**) — **pipe the `.pem` in** (never paste it; flattened newlines break
      the key), and **scope both to those same repos** (least privilege — the key can
      act as the App: commits, PRs, releases, workflow edits):

      ```bash
      gh secret set CI_APP_PRIVATE_KEY --org evanharmon1 \
        --visibility selected --repos <repo-a>,<repo-b> < evanharmon1-ci.private-key.pem
      gh variable set CI_APP_CLIENT_ID --org evanharmon1 \
        --visibility selected --repos <repo-a>,<repo-b> --body "<client-id>"  # Iv…-style, not the numeric App ID
      ```

      Personal account: use `--repo evanharmon1/evanharmon-site` instead of
      `--org`/`--visibility`/`--repos`. Re-running `--repos` **replaces** the list —
      re-run with the full list to add a repo. Drives release-please, the claude-*
      workflows, and project-automation; blast-radius + rotation in
      docs/architecture/security.md.
- [x] GHCR: ensure the org/user allows publishing packages; the first
      devcontainer prebuild populates `ghcr.io/evanharmon1/evanharmon-site-devcontainer` on merge to main
- [x] GitHub Project: run `task setup:github-project` (needs
      `gh auth refresh -s project`) to create the owner's default project (titled
      `evanharmon1 Project`) and idempotently sync its `Status` pipeline and
      `Size` number field — see
      [project-management.md](project-management.md).
      On a personal account it also creates Priority/Product/Domain/Layer/
      Size as project fields (issue fields are org-only); status automation is a
      separate follow-up — the board is set up, but issue/PR status isn't
      auto-synced yet. `Domain` is seeded with `auth`/`billing`/`platform` only —
      add this product's real domains in the Project UI, and matching `domain:`
      labels in `scripts/setup-github-labels.sh`. Re-runs **append** any starter
      option a single-select field is missing (so a value added by a later
      harmon-init release lands on the next run) and never touch, reorder, or
      delete the options you added.
- [x] Labels: run `task setup:github-labels` to seed this repo's starter label
      families (concerns/source/workflow/layer/domain — see
      [project-management.md](project-management.md)). Labels are per-repo, so run
      it in each repo; org default labels (org Settings → Repository, UI-only) only
      seed new repos.
- [ ] **[human-only] Retire any legacy `agent:*` claim labels** — needed only
      where `gh label list --limit 200` still shows the harness-named family
      (`agent:claude-code`, `agent:gemini-cli`, …) a pre-registry harmon-init
      seeded. **Pass an explicit `--limit` to every `gh label list`,
      `gh issue list`, and `gh pr list` in this step**: all three default to 30,
      the starter set alone is over 40 labels, and an unbounded read reports a
      clean repo — or a finished migration — while legacy labels, in-flight
      claims, and labelled pull requests remain.
      `setup-github-labels` never deletes a label, so the old family
      survives beside the registry-rendered `claim:*` one, and every reader
      tolerates both — this is cleanup, not a fix for something broken.
      **Rename, never re-create**: `gh label edit agent:claude-code --name
      claim:claude --repo <owner/repo>` edits the label object in place, so every
      issue and PR carrying it keeps it, where create-then-delete would silently
      drop those associations. Map by **model family, not harness** —
      `agent:gemini-cli` → `claim:gemini`, `agent:kimi-k2` → `claim:kimi`,
      `agent:qwen-code` → `claim:qwen` — these three are fixed-family
      harnesses, so the mapping is unconditional. `agent:github-copilot` is
      **not**: Copilot is a broker (registry `family_constraint.kind:
      "broker"`, default `mai`), so an old claim under that label may
      actually have run GPT, Claude, or another brokered family — check the
      claim/session record for which one before renaming, and rename to
      `claim:<actual-family>` (only `claim:mai` when the record confirms
      MAI). When the actual family can't be recovered: for a live claim,
      settle it with its owner first rather than guess; for a
      released/historical one, just delete the stale `agent:github-copilot`
      label off that issue/PR instead of renaming it — a guessed family is
      worse than none, since the claim label's whole meaning is the family.
      Target names otherwise come from
      `node scripts/agent-registry-labels.mjs suggest-claim`.
      **Destination-collision procedure**: a rename whose target already
      exists is rejected by GitHub (`gh label edit` errors: the destination
      name is already in use — e.g. `claim:claude` already exists from a prior
      `setup-github-labels` run). When that happens, migrate ASSOCIATIONS
      instead of the label object: for every issue and PR carrying the old
      label, add the destination label and remove the old one
      (`gh issue edit <number> --add-label claim:claude --remove-label
      agent:claude-code --repo <owner/repo>`; the same `--add-label
      X --remove-label Y` pair works on `gh pr edit`), then delete the
      now-empty old label (`gh label delete agent:claude-code --repo
      <owner/repo> --yes`) once a re-read of `gh issue list --label
      agent:claude-code --state all --limit 200` **and** the equivalent
      `gh pr list` both return nothing — only then is it safe to delete; the
      other checklist items below that reference this procedure reuse it
      verbatim. Enumerate **`gh pr list` as well as `gh issue list`**
      throughout, collision or not: labels apply to
      pull requests too and `gh issue list` never returns them, so deleting the
      legacy label afterwards would drop exactly the associations the re-labelling
      missed — the loss this whole item exists to avoid. Check for in-flight
      claims first — `gh issue list --label agent:… --state all --limit 200`
      **and** `gh pr list --label agent:… --state all --limit 200`: a claim
      record naming the old label will not release the renamed one, so settle or
      amend those records in the same sitting. Re-read `gh label list --limit 200` afterwards — no `agent:*`
      should remain.
- [ ] **[human-only] Retire pre-2026-refresh `codex`/`copilot` agent labels** —
      needed only where an explicit enumeration shows
      `suggest:codex`/`claim:codex` or `suggest:copilot`/`claim:copilot`
      still exist: `gh label list --repo <owner/repo> --limit 1000 --json
      name --jq '.[].name' | grep -E '^(suggest|claim):(codex|copilot)$'`
      (the default `gh label list --limit 200` paged listing can miss these
      on a repo with many labels — use this enumeration, not the paged form,
      everywhere in this item). harmon-init issue #751 renamed those families
      to `gpt` and `mai` (Codex and Copilot are harnesses, not families — the
      same harness/family split D9 already made elsewhere; see ADR 0005 D8).
      A `setup-github-labels` re-run never deletes the old family, so it
      survives beside the new registry-rendered one.

      **`codex` → `gpt` is a fixed mapping** (Codex only ever ran GPT) —
      **rename, never re-create**, the same way as the `agent:*` item above:
      `gh label edit suggest:codex --name suggest:gpt --repo <owner/repo>`
      (repeat for `claim:codex`), which preserves issue/PR associations
      instead of dropping them.

      **`copilot` is NOT a fixed mapping — apply the same broker caution as
      the `agent:github-copilot` entry in the `agent:*` item above, not a
      blanket rename to `mai`.** Copilot is a broker (registry
      `family_constraint.kind: "broker"`, default `mai`): a `claim:copilot`
      may have actually run GPT, Claude, or another brokered family, and
      `suggest:copilot` only ever named a harness preference, never an MAI
      one. For `claim:copilot`, follow the `agent:*` item's procedure exactly
      — check the claim/session record for the actual family and rename to
      `claim:<actual-family>` (only `claim:mai` when the record confirms
      MAI); when unrecoverable, settle a live claim with its owner first, or
      delete the stale label from a released/historical issue/PR instead of
      guessing. For `suggest:copilot`, there is no rename to make: re-express
      the intent by re-labelling each issue with whichever family it actually
      meant, or drop the label, rather than mechanically renaming a harness
      name into a family slot it never occupied.

      **If the destination already exists** — a `setup-github-labels` re-run
      already created `suggest:gpt`/`claim:mai` before this cleanup runs —
      `gh label edit` is rejected the same way; use the **destination-collision
      procedure from the `agent:*` item above** (add the new label to every
      issue/PR carrying the old one, remove the old, then delete the old label
      once empty) instead of trying to rename over it. Check for in-flight
      claims first — `gh issue list --label claim:codex --state all --limit
      1000` **and** `gh pr list --label claim:codex --state all --limit
      1000` (repeat for `claim:copilot`, remembering the broker caution above
      governs what you rename it to) — and settle or amend any that name the
      old label before renaming it out from under them. Re-run the
      enumeration above afterwards — it should return nothing.

      **Also check for model-level labels naming the old family** —
      `suggest:codex:<model>` / `claim:codex:<model>` /
      `suggest:copilot:<model>` / `claim:copilot:<model>` (`suggest:codex:sol`,
      `claim:copilot:code-1-flash`, …). Those are created on demand rather than
      seeded, so the same paged-listing gap applies — enumerate with the
      family prefix: `gh label list --repo <owner/repo> --limit 1000 --json
      name --jq '.[].name' | grep -E '^(suggest|claim):(codex|copilot):'`.
      Rename each `codex:<model>` label the same fixed-mapping way,
      **preserving its model suffix** (`suggest:codex:sol` →
      `suggest:gpt:sol` — the model slug is unchanged, only the family
      segment moves), and run the same in-flight-claim check per label before
      renaming it (`gh issue list --label suggest:codex:sol --state all
      --limit 1000` / `gh pr list --label suggest:codex:sol --state all
      --limit 1000`, one pair per label found). **`copilot:<model>` labels get
      the same broker treatment as the family-level ones above** — determine
      the actual family per label from its claim/session record and rename
      preserving the suffix (`claim:copilot:code-1-flash` →
      `claim:<actual-family>:code-1-flash`), or remove/re-express rather than
      assume `mai`. **Collisions use the same destination-collision procedure
      too** — a model-level label can already exist for the same reason a
      family-level one can (an on-demand `suggest:gpt:sol` created before this
      cleanup ran) — migrate associations from `suggest:codex:sol` to
      `suggest:gpt:sol` and delete `suggest:codex:sol` once it carries no
      issues or PRs, rather than renaming over the existing one. Re-run the
      `grep` above afterwards — it should return nothing.
- [ ] Project views: create the starter views (Board / Triage / Agent queue /
      Planning / Mine) in the Project UI — Projects V2 has no view API,
      so this is a one-time manual step. Filters/layouts are in
      [project-management.md](project-management.md).
- [x] GitHub Project auto-add (**adds every issue to the board**): in the
      Project's **Settings → Workflows**, turn on **"Auto-add to project"** and
      point it at this repo (filter `is:issue`, `is:pr`) so *every* new issue and
      PR lands on the board automatically, however it's created. GitHub's native
      built-in — no Actions or tokens, and it's the reliable way to guarantee
      coverage (the issue-form `projects:` key only covers form-created issues and
      needs a static project number). See
      [project-management.md](project-management.md).

## 3. Framework scaffolding (conventions-only template)

- [x] Scaffold Astro: `pnpm create astro@latest . --template minimal` (or preferred template)
- [x] Add the standard stack: Tailwind v4 (`@tailwindcss/vite`), zod, vitest, lucide
- [ ] Move lint tooling into devDependencies (prettier, eslint, markdownlint-cli2,
      @commitlint/cli); switch the `lint:prettier` / `lint:markdown` `npx --yes`
      calls to `pnpm exec` (`lint:eslint` already uses it once a config + deps exist)
- [ ] Install the shipped `eslint.config.js`'s plugins:
      `pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-astro globals`
- [ ] Install the shipped prettier config's plugins:
      `pnpm add -D prettier prettier-config-standard prettier-plugin-astro prettier-plugin-tailwindcss`
- [ ] Build-script approvals + version pins already ship in
      **`pnpm-workspace.yaml`** — the template pre-approves `esbuild` + `sharp`
      (and **`workerd`** when deploying to Cloudflare Workers, so `wrangler deploy`
      doesn't fail `ERR_PNPM_IGNORED_BUILDS`) under `allowBuilds`, and floors
      `esbuild` at the patched `>=0.28.1` under `overrides` (pnpm 10+ blocks
      dependency build scripts by default). Add any other packages whose build
      scripts your deps need to `allowBuilds` (or run `pnpm approve-builds`); keep
      all pnpm `overrides` / `auditConfig` there too, **not** in the `package.json`
      `pnpm` field — pnpm 10+ silently ignores that field, so entries there vanish
      on the next lockfile resolve
- [ ] Review `lighthouserc.json` URLs once routes exist
- [ ] Enable mobile device projects in `playwright.config.ts` (e.g. Pixel +
      iPhone) — the Playwright scaffold ships them commented out, and
      mobile-first is the convention
- [ ] Accessibility (axe-core): `pnpm add -D @playwright/test
      @axe-core/playwright` — the shipped `tests/a11y.spec.ts` imports both, so
      `tsc`/`astro check` fail until they're installed (pair the spec with the
      dep install). Then add a
      `playwright.config.ts` with a `webServer` (starts `astro dev`/preview) +
      `baseURL` so `tests/a11y.spec.ts` can run — this complements the Lighthouse
      a11y gate (static pages) by covering interactive states (nav, cookie
      banner, forms). `task test:a11y` skips until that config exists; once it
      does, the non-blocking `a11y` CI job runs automatically.
- [ ] Once real routes exist and pass axe, promote the `a11y` CI job to a
      required check: add `a11y` to `verify.needs` + a `check a11y` line in
      `.github/workflows/build.yml`, and add it to the ruleset's
      `required_status_checks`.

## 4. Secrets & environment

- [ ] Cloudflare Workers deploys: create an **Account API Token** scoped to
      **Account → Workers Scripts → Edit** only (1-year TTL + renewal
      reminder) and add it: `gh secret set CLOUDFLARE_API_TOKEN`. The
      `CLOUDFLARE_ACCOUNT_ID` org-level Actions variable is shared org-wide —
      set it once per org if missing.
- [ ] Create the `preview` and `production` GitHub Environments (production:
      restrict to protected branches). Then bootstrap the Worker: Actions →
      *Release Please* → *Run workflow* (main) — the first `wrangler deploy`
      creates it; PR preview uploads work from that point.

- [ ] For local `.env` needs, use **1Password Environments** (mounts a virtual
      `.env`; secrets never hit disk or git) or `op run`/`op inject`. Commit only
      `.env.example`-style files
- [ ] Devcontainer secrets: create a **1Password environment** that mounts
      `.devcontainer/devcontainer.env` (and `.devcontainer/dev/devcontainer.env`)
      with `GH_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`, `AGENT_DECK_TELEGRAM_KEY`
      (+ `TS_AUTHKEY` for the dev profile). `init-env.sh` enforces the per-profile
      allow-list; on Coder the values come from workspace parameters. See
      [guides/devcontainers.md](guides/devcontainers.md)

## 5. Docs & meta

- [ ] Fill in the `TODO:` markers in README.md and docs/ (architecture diagram first)
- [x] Confirm README badges render (Actions URLs are correct once CI runs)
- [x] Initial release when ready: `task release:init` (v0.1.0) — releases stay manual
- [ ] Stay current with harmon-init: periodically run `copier update --trust` to pull
      template improvements (a three-way merge — your own edits are preserved). The
      standardize-repo skill (`update` mode) automates this and verifies the result.

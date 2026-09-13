# Brewfile for Evan Harmon Website
# Install with: task install  (brew bundle --file=Brewfile)

# Task runner + git hooks
brew "go-task"
brew "lefthook"

# Git / GitHub
brew "git"
brew "gh"
brew "git-delta"

# Lint / format
brew "shellcheck"
brew "shfmt"
brew "actionlint"
brew "yamllint"

# Security
brew "gitleaks"

# Runtime for npx-based tools (commitlint, markdownlint-cli2)
brew "node"
brew "pnpm"
brew "lychee"
# Python tool runner (Semgrep CE + foreman lint use uv/uvx)
brew "uv"
# Repository scripts (status, secret helpers) parse JSON with bare `python3`.
# lint-hygiene.sh also parses .foreman.toml with bare `python3` + tomllib (>= 3.11).
# Stock macOS ships 3.9 and uv provides no `python3` shim, so the interpreter
# itself is still a dependency.
brew "python"

# Devcontainer
brew "hadolint"

# Skills sync (scripts/sync-skills.sh reads .skills-sync.yaml)
brew "yq"

# Utilities
# coreutils provides `timeout`, which stock macOS lacks — scripts/status.sh
# bounds its network probes with it.
brew "coreutils"
brew "direnv"
brew "jq"
brew "fzf"
brew "fd"
brew "ripgrep"
brew "bat"
brew "tokei"
brew "gum"          # status dashboard rendering (scripts/status.sh)
brew "television"   # interactive task menu (`task` / task menu-tv → tv)

# Second-model review (task challenge / task review drive the Codex CLI).
# Cask = macOS only; on Linux/devcontainers install with
# `npm install -g @openai/codex` (a bare cask line would abort `brew bundle`
# on Linux before any of the remaining deps install).
cask "codex" if OS.mac?

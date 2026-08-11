#!/usr/bin/env bash
set -euo pipefail

export DEVCONTAINER_GIT_NAME="evanharmon1-bot"
export DEVCONTAINER_GIT_EMAIL="evanharmon1-bot@users.noreply.github.com"

bash .devcontainer/scripts/post-create-common.sh

# Bot profile: default Claude to bypassPermissions (no per-action prompts) —
# the container is the isolation boundary. The dev profile deliberately omits
# this so a human gets the normal prompt-on-action default.
bash .devcontainer/scripts/enable-claude-bypass.sh
bash .devcontainer/scripts/enable-codex-bypass.sh
bash .devcontainer/scripts/enable-codex-bypass.sh

# An earlier template version may have enabled the opt-in. Restore its recorded
# policy values when this answer is turned off; this is a no-op otherwise.
bash /usr/local/share/devcontainer-config/apply-antigravity-settings.sh restore

# Install repo-managed git hooks (source of truth: .devcontainer/hooks/).
# This replaces the default git-lfs hooks with versions that also handle
# auto-installing node_modules in new worktrees.
if [ -d .devcontainer/hooks ]; then
    echo "==> Installing git hooks from .devcontainer/hooks/..."
    cp .devcontainer/hooks/* .git/hooks/
    chmod +x .git/hooks/*
fi

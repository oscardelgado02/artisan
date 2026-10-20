#!/bin/sh
# Artisan — install the CLI and the /artisan-* packs for your agentic tools.
# Run from the repo root (or any path: the script locates its own repo).
set -e

REPO_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$REPO_DIR"

# 1. The CLI
# The version is pinned by package.json: a bare `pnpm add -g artisan-uml-cli`
# can resolve an OLDER release (pnpm's 24 h minimumReleaseAge ignores `latest`),
# and the packs document the behaviour of the pinned one.
if ! command -v node >/dev/null 2>&1; then
  echo "  (node 18+ is required — install Node first)" >&2
  exit 1
fi
CLI_SPEC=$(node -p "require('./package.json').dependencies['artisan-uml-cli']")
echo "→ Installing artisan-uml-cli@$CLI_SPEC"

CLI_OK=1
GLOBAL_BIN=""
if command -v pnpm >/dev/null 2>&1; then
  if pnpm add -g "artisan-uml-cli@$CLI_SPEC"; then
    GLOBAL_BIN=$(pnpm bin -g 2>/dev/null || true)
  else
    # Global dir not writable (no sudo): retry with a user-local PNPM_HOME.
    echo "  global pnpm dir is not writable — retrying with PNPM_HOME=$HOME/.local/share/pnpm"
    PNPM_HOME="$HOME/.local/share/pnpm"
    export PNPM_HOME
    PATH="$PNPM_HOME/bin:$PATH"
    export PATH
    if pnpm add -g "artisan-uml-cli@$CLI_SPEC"; then
      GLOBAL_BIN=$(pnpm bin -g 2>/dev/null || true)
    else
      CLI_OK=0
    fi
  fi
elif command -v npm >/dev/null 2>&1; then
  if npm install -g "artisan-uml-cli@$CLI_SPEC"; then
    GLOBAL_BIN="$(npm prefix -g 2>/dev/null)/bin"
  elif npm install -g --prefix "$HOME/.local" "artisan-uml-cli@$CLI_SPEC"; then
    GLOBAL_BIN="$HOME/.local/bin"
  else
    CLI_OK=0
  fi
else
  echo "  (no pnpm/npm on PATH — install Node 18+ first)" >&2
  exit 1
fi

# 2. The packs
echo "→ Copying agent packs"
if [ -d "$HOME/.config/opencode" ]; then
  mkdir -p "$HOME/.config/opencode/commands"
  cp agents/opencode/artisan-*.md "$HOME/.config/opencode/commands/"
  echo "  opencode:     $HOME/.config/opencode/commands/"
fi
if [ -d "$HOME/.claude" ]; then
  mkdir -p "$HOME/.claude/commands"
  cp agents/claude/artisan-*.md "$HOME/.claude/commands/"
  echo "  Claude Code:  $HOME/.claude/commands/"
fi
if [ -d "$HOME/.codex" ]; then
  mkdir -p "$HOME/.codex/prompts"
  cp agents/codex/artisan-*.md "$HOME/.codex/prompts/"
  echo "  Codex:        $HOME/.codex/prompts/"
fi
if [ -d "$HOME/.config/opencode" ]; then
  mkdir -p "$HOME/.config/opencode/skills/artisan-cli"
  cp skills/artisan-cli/SKILL.md "$HOME/.config/opencode/skills/artisan-cli/"
  echo "  opencode skill: $HOME/.config/opencode/skills/artisan-cli/"
fi

# 3. PATH
echo
if [ -n "$GLOBAL_BIN" ] && [ -x "$GLOBAL_BIN/artuml" ]; then
  MARKER="# artuml (added by install.sh)"
  for rc in "$HOME/.profile" "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ -f "$rc" ] && ! grep -qF "$MARKER" "$rc"; then
      {
        printf '\n%s\n' "$MARKER"
        if [ -n "$PNPM_HOME" ]; then
          printf 'export PNPM_HOME="%s"\n' "$PNPM_HOME"
        fi
        printf 'export PATH="%s:$PATH"\n' "$GLOBAL_BIN"
      } >> "$rc"
      echo "Added $GLOBAL_BIN to PATH in $rc"
    fi
  done
fi

echo "Done. Restart your agentic tool, then in any project:"
echo "  artuml scan"
if [ "$CLI_OK" -eq 0 ]; then
  echo "The CLI could NOT be installed (see the error above) — the packs above are in place."
  echo "  Install it manually: pnpm add -g \"artisan-uml-cli@$CLI_SPEC\""
  echo "  Or run it without installing: npx --yes \"artisan-uml-cli@$CLI_SPEC\" <command>"
  if command -v artuml >/dev/null 2>&1; then
    echo "Note: an older artuml is still on PATH: $(command -v artuml) ($(artuml --version 2>/dev/null || echo unknown))"
  fi
elif command -v artuml >/dev/null 2>&1; then
  echo "CLI on PATH: $(command -v artuml)"
  echo "CLI version: $(artuml --version 2>/dev/null || echo unknown)"
elif [ -n "$GLOBAL_BIN" ] && [ -x "$GLOBAL_BIN/artuml" ]; then
  PATH="$GLOBAL_BIN:$PATH"
  export PATH
  echo "CLI on PATH: $(command -v artuml) (open a new shell to pick it up everywhere)"
  echo "Agent shells (opencode, Claude Code, Codex) do not read ~/.profile or ~/.bashrc."
  echo "Give them the CLI with this line:"
  echo "  export PATH=\"$GLOBAL_BIN:\$PATH\""
  echo "or run the package directly: npx --yes \"artisan-uml-cli@$CLI_SPEC\" <command>"
else
  echo "The CLI is installed but 'artuml' is not on this shell's PATH (open a new shell)."
  echo "Or run the package directly: npx --yes \"artisan-uml-cli@$CLI_SPEC\" <command>"
fi
echo "Missing a tool folder above? Copy its packs manually (see agents/README.md)."

[ "$CLI_OK" -eq 1 ]

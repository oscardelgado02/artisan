#!/bin/sh
# Artisan — install the CLI and the /artisan-* packs for your agentic tools.
# Run from the repo root.
set -e

# 1. The CLI (editor bundles with it)
echo "→ Installing artisan-uml-cli"
if command -v pnpm >/dev/null 2>&1; then
  pnpm add -g artisan-uml-cli
elif command -v npm >/dev/null 2>&1; then
  npm install -g artisan-uml-cli
else
  echo "  (no pnpm/npm on PATH — install Node 18+ first)" >&2
  exit 1
fi

# 2. The packs
echo "→ Copying agent packs"
if [ -d "$HOME/.config/opencode" ]; then
  mkdir -p "$HOME/.config/opencode/command"
  cp agents/opencode/artisan-*.md "$HOME/.config/opencode/command/"
  echo "  opencode:     $HOME/.config/opencode/command/"
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

echo
echo "Done. Restart your agentic tool, then in any project:"
echo "  artisan scan"
echo "Missing a tool folder above? Copy its packs manually (see agents/README.md)."

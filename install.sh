#!/bin/sh
# Artisan — install the CLI and the /artisan-* packs for your agentic tools.
# Run from the repo root.
set -e

# 1. The CLI (editor bundles with it)
echo "→ Installing artisan-uml-cli"
if command -v pnpm >/dev/null 2>&1; then
  pnpm add -g artisan-uml-cli
  GLOBAL_BIN="$(pnpm bin -g 2>/dev/null || true)"
elif command -v npm >/dev/null 2>&1; then
  npm install -g artisan-uml-cli
  GLOBAL_BIN="$(npm prefix -g 2>/dev/null)/bin"
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
if command -v artisan >/dev/null 2>&1; then
  echo "CLI on PATH: $(command -v artisan)"
elif [ -n "$GLOBAL_BIN" ] && [ -x "$GLOBAL_BIN/artisan" ]; then
  PATH="$GLOBAL_BIN:$PATH"; export PATH
  MARKER="# artisan (added by install.sh)"
  for rc in "$HOME/.profile" "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ -f "$rc" ] && ! grep -qF "$MARKER" "$rc"; then
      printf '\n%s\nexport PATH="%s:$PATH"\n' "$MARKER" "$GLOBAL_BIN" >> "$rc"
      echo "Added $GLOBAL_BIN to PATH in $rc"
    fi
  done
  if command -v artisan >/dev/null 2>&1; then
    echo "CLI on PATH: $(command -v artisan) (open a new shell to pick it up everywhere)"
  else
    echo "Note: $GLOBAL_BIN/artisan exists but this shell's PATH was not updated (add $GLOBAL_BIN manually)."
  fi
  echo "Agents without PATH can always run: npx --yes artisan-uml-cli <command>"
else
  echo "Note: 'artisan' is not on this shell's PATH (open a new shell to pick it up)."
  echo "      Agents without PATH can always run: npx --yes artisan-uml-cli <command>"
fi
echo "Missing a tool folder above? Copy its packs manually (see agents/README.md)."

#!/bin/sh
# Install/update the local Artisan CLI into the durable opencode config dir
# (survives between sessions, unlike ~/.local). Run from the repo root.
set -e
DEST="$HOME/.config/opencode/artisan"

mkdir -p "$DEST/cli" "$DEST/bin"
rm -rf "$DEST/cli/bin" "$DEST/cli/lib"
cp -r cli/bin cli/lib cli/package.json "$DEST/cli/"
rm -rf "$DEST/cli/lib/editor-dist"
cp -r editor/dist "$DEST/cli/lib/editor-dist"

printf '#!/bin/sh\nexec node "$HOME/.config/opencode/artisan/cli/bin/artisan.mjs" "$@"\n' > "$DEST/bin/artisan"
chmod +x "$DEST/bin/artisan"

mkdir -p "$HOME/.config/opencode/command"
cp agents/opencode/artisan-*.md "$HOME/.config/opencode/command/"

echo "Installed:"
echo "  CLI:     $DEST/cli  (editor bundled)"
echo "  Shim:    $DEST/bin/artisan"
echo "  Packs:   $HOME/.config/opencode/command/artisan-*.md"
echo "Restart opencode to reload commands."

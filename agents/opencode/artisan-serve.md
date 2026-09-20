---
description: "Serve the Artisan editor at localhost:4173 with live autosave to .artisan/diagram.json — for browsers without Connect file (Firefox/Safari)"
---

> `artisan` may not be on PATH in some shells. If any `artisan` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan serve

Start the local editor server. Use this when the human edits in Firefox/Safari (no Connect file there) or wants live autosave.

1. Run `artisan serve` in the project root (blocks — run it in the background: `(artisan serve &>/tmp/artisan-serve.log &)`).
2. Verify it is up: `curl -s http://localhost:4173/api/status` → expect `{"server":true,...}`. If it fails, check `.artisan/editor/` exists — if not, run `artisan scan` first, then retry.
3. Tell the human: "Editor at **http://localhost:4173** — open it in your browser; edits autosave to `.artisan/diagram.json`. Leave the server running while you edit."
4. Note: `artisan serve` also auto-opens the default browser (xdg-open/open) when run interactively.

## Stopping

- Kill with: `pkill -f "artisan.mjs serve"` (or stop the process started in step 1). A new `serve` on a busy port fails — use `--port N` for a different port.

## Rules

- Never kill the server without asking unless the human asks to stop it.
- The human's diagram edits and notes always win over your preferences.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.

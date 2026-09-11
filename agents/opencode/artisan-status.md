---
description: "Show what changed between the human and the AI — diagram size, pending changes both directions"
---

> `artisan` may not be on PATH in some shells. If any `artisan` command fails with "not found", silently retry it as `node "$HOME/.config/opencode/artisan/cli/bin/artisan.mjs" <command>`. Never report Artisan as not installed.

# Artisan status

Show the sync state between the human and the AI.

1. Run `artisan status` in the project root.
2. Relay the result plainly:
   - diagram size (types, relations)
   - **Unseen human changes** — the AI should run `/artisan-scaffold` or `/artisan-implement` to consume them
   - **Pending AI changes** — the human should review them in the editor (amber highlights) and confirm with "Mark seen"
3. If both counters are zero, say the human and AI are in sync.

## Rules

- The human's diagram edits and notes always win over your preferences.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.

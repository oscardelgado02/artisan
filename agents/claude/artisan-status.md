---
description: "Show what changed between the human and the AI — diagram size, actual human changes, pending changes both directions"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan status

Show the sync state between the human and the AI.

1. Run `artuml status` in the project root. It reports the counters AND — when there are unseen human changes — the actual change report (as a non-consuming peek; nothing is marked seen).
2. Run `artuml mark-ai` so the human sees any of the AI's own unacknowledged edits as amber highlights.
3. Relay the result plainly:
   - diagram size (types, relations)
   - **Unseen human changes** — show them from the peek; the AI should run `/artisan-scaffold` or `/artisan-implement` to consume them
   - **Pending AI changes** — the human should review them in the editor (amber highlights) and confirm with "Mark seen"
4. If both counters are zero, say the human and AI are in sync.

## Rules

- The human's diagram edits and notes always win over your preferences.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.

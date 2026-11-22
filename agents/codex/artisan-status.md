---
description: "Show what changed between the human and the AI — diagram size, actual human changes, pending changes both directions"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

> **Artisan asks:** surface every question to the human through the harness's own question UI (options / multiple-choice / free text) when it has one, and include 🎨 in the question text so it's identifiable as an artisan ask; if no question UI is available, start the question line with 🎨❓ so it stands out at a glance.

# Artisan status

Show the sync state between the human and the AI.

1. Run `artuml status` in the project root. It reports the counters AND — when there are unseen human changes — the actual change report (as a non-consuming peek; nothing is marked seen).
2. Relay the result plainly:
   - diagram size (types, relations)
   - **Unseen human changes** — show them from the peek; the AI should run `/artisan-scaffold` or `/artisan-implement` to consume them. If they add, rename or remove types and `.artisan/context.md` exists, offer matching `## Glossary` updates once (skip if the human declined before)
   - **Pending AI changes** — the human should review them in the editor (amber highlights) and confirm with "Mark seen"
3. If both counters are zero, say the human and AI are in sync.

## Rules

- The human's diagram edits and notes always win over your preferences.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.

---
description: "Propose an architecture change in the diagram — the human reviews the amber highlights and decides; no code is touched"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan architect

The human asked for a proposed architecture change. Their request: `$ARGUMENTS`

The human owns the architecture. You propose in the diagram — you never decide, and you never touch code in this mode.

1. Read the current state: run `artuml diff` (any unseen human edits appear there — fold them into your proposal), then read `.artisan/diagram.json` (structure) and `.artisan/diagram.puml`.
2. Express the proposed architecture through the CLI commands, not by editing `diagram.json`:
   - `artuml add node|member|edge ...` — additions
   - `artuml edit node|member|edge ...` — changes
   - `artuml remove node|member|edge ...` — removals
   Set `--note` fields to explain why. Edit `.artisan/diagram.json` directly ONLY as a last resort, when no command covers the case (keep existing node `id`s and positions).
3. Run `artuml mark-ai` once, after all changes are in.
4. Tell the user: "Proposed architecture is in the editor (amber highlights) — open `.artisan/diagram.html`, review, adjust, then confirm with Mark seen. Nothing in the code changes until you say `/artisan-scaffold` or `/artisan-implement`."
5. DO NOT write or change any code files.

## Rules

- The human's diagram edits and notes always win over your preferences.
- If the request is ambiguous, ask before editing the diagram.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.

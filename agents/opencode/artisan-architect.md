---
description: "Propose an architecture change in the diagram — the human reviews the amber highlights and decides; no code is touched"
---

> `artisan` may not be on PATH in some shells. If any `artisan` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan architect

The human asked for a proposed architecture change. Their request: `$ARGUMENTS`

The human owns the architecture. You propose in the diagram — you never decide, and you never touch code in this mode.

1. Read the current diagram: `.artisan/diagram.json` (structure) and `.artisan/diagram.puml`.
2. Edit `.artisan/diagram.json` DIRECTLY to express the proposed architecture (add/change/remove nodes, edges, members — set `note` fields to explain why). Keep existing node `id`s and positions where possible.
3. Run `artisan mark-ai`.
4. Tell the user: "Proposed architecture is in the editor (amber highlights) — open `.artisan/diagram.html`, review, adjust, then confirm with Mark seen. Nothing in the code changes until you say `/artisan-scaffold` or `/artisan-implement`."
5. DO NOT write or change any code files.

## Rules

- The human's diagram edits and notes always win over your preferences.
- If the request is ambiguous, ask before editing the diagram.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.

---
description: "Scan your code into a class diagram (.artisan/) so you and the AI share the same architecture picture"
---

> `artisan` may not be on PATH in some shells. If any `artisan` command fails with "not found", silently retry it as `node "$HOME/.config/opencode/artisan/cli/bin/artisan.mjs" <command>`. Never report Artisan as not installed.

# Artisan scan

Scan the codebase into a class diagram. The human owns the architecture — this just builds the picture.

1. Run `artisan scan` in the project root.
2. Read `.artisan/diagram.puml` — the current architecture (classes, members, relations, and human-written `note`s).
3. Tell the user: "Diagram ready — open `.artisan/diagram.html` (double-click it; no server needed). `artisan serve` is optional. Tell them: click **Connect file** in the editor toolbar once and pick `.artisan/diagram.json` — edits then autosave to disk."
4. Summarize the architecture in a few sentences. The scan detects inheritance, realization, composition, aggregation, association and dependency, and lays classes out in layers (roots on top).

Honor all notes (class notes, member notes, project notes) — they are the human's binding instructions.

## Rules

- The human's diagram edits and notes always win over your preferences.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.
- After editing the diagram, the human runs `/artisan-scaffold` or `/artisan-implement` to turn edits into code.

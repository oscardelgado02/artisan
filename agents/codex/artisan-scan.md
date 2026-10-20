---
description: "Scan your code into a class diagram (.artisan/) so you and the AI share the same architecture picture"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan scan

Scan the codebase into a class diagram. The human owns the architecture — this just builds the picture.

1. Run `artuml scan` in the project root.
2. Run `artuml mark-ai` — any diagram changes the rescan introduced show up as amber highlights for the human to review.
3. Read `.artisan/diagram.puml` — the current architecture (classes, members, relations, and human-written `note`s).
4. Tell the user: "Diagram ready. To modify the architecture, `artuml serve` is highly recommended (live autosave) — `/artisan-serve` sets it up. A plain `.artisan/diagram.html` opened as a file is read-only."
5. Summarize the architecture in a few sentences. The scan detects inheritance, realization, composition, aggregation, association and dependency, and lays classes out in layers (roots on top).

Honor all notes (class notes, member notes, project notes) — they are the human's binding instructions.

## Rules

- The human's diagram edits and notes always win over your preferences.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.
- After editing the diagram, the human runs `/artisan-scaffold` or `/artisan-implement` to turn edits into code.

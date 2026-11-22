---
description: "Implement the human's diagram edits into real code — artuml scaffold first, then write proper method bodies, following all diagram notes"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

> **Artisan asks:** surface every question to the human through the harness's own question UI (options / multiple-choice / free text) when it has one, and include 🎨 in the question text so it's identifiable as an artisan ask; if no question UI is available, start the question line with 🎨❓ so it stands out at a glance.

# Artisan implement

Apply the human's diagram edits to the project's code with real implementations. Argument (optional): `$ARGUMENTS`

The human owns the architecture. You execute what the diagram says — nothing more.

1. Run `artuml diff`. It prints a markdown change report (the human's diagram edits since last time, with renames detected as renames) and consumes it.
2. Read `.artisan/context.md` too, if it exists — its Requirements and Invariants bind the bodies you write; cite it when a choice traces to it (e.g. "follows R2"). Never edit it (only `/artisan-context` and the human do).
3. Run `artuml scaffold` first. It does all the mechanical work itself — stub files/members, signature patches, silent renames, `dir` moves, gated removals (see `/artisan-scaffold` for the report walkthrough) — and refreshes `impl-diff.json`. The scaffolds it emits are your to-do list.
4. Write real method bodies (not stubs) — every **note** in the report is the spec and a binding instruction from the human.
5. Handle what needs judgement, from the scaffold report:
   - **Renames**: refactor call sites outside the renamed file.
   - **Declined removals / code not in the diagram**: relay to the human once; only rerun `artuml scaffold --yes` after an explicit yes.
   - **Manual moves** (shared multi-type files) and **namespace drift** after moves: resolve or ask the human.
   - **Glossary drift**: if the report added, renamed or removed types and `.artisan/context.md` exists, propose matching `## Glossary` lines to the human — propose once, never edit the file silently.
6. If a body needs a decision neither the diagram nor `.artisan/context.md` answers, ask the human — don't invent architecture.
7. Report what you did, file by file.

## Removals — always one prompt, never silent

Code the diagram no longer declares is only removed through the CLI's own single prompt. Never delete such code by hand.

- In agent shells (non-interactive) it removes nothing and lists the candidates — relay them to the human exactly once. If the human confirms, rerun `artuml scaffold --yes` (add `--src` if you used it before). Never rerun with `--yes` without an explicit human yes.

Config: project `.artisan/config.json` wins, global fallback — exact keys and paths: load the `artisan-cli` skill.

## Rules

- Never modify or delete an existing class/member unless the scaffold or diff report lists it.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.

---
description: "Day-zero setup: scan the project into .artisan/ (diagram + editor) and create .artisan/context.md via the /artisan-context questionnaire"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

> **Artisan asks:** surface every question to the human through the harness's own question UI (options / multiple-choice / free text) when it has one, and include 🎨 in the question text so it's identifiable as an artisan ask; if no question UI is available, start the question line with 🎨❓ so it stands out at a glance.

# Artisan set-up

First-run onboarding: structure + intent in one pass. Task (optional): `$ARGUMENTS`

1. **Diagram.** If `.artisan/diagram.json` is missing, run `artuml scan`. Pick `--src`:
   - if the human named a directory in `$ARGUMENTS`, use it;
   - else if there is exactly one obvious C# root (a directory containing .cs files), propose it and confirm;
   - else ask.
   Relay the scan summary (types, relations, editor location). Scan seeds `.artisan/context.md` as a template — leave it; step 2 fills it.
2. **Context.** Follow the `/artisan-context` pack now:
   - `context.md` still template/missing → run its create flow (the diagram exists by now, so draft the Glossary from node names).
   - `context.md` already filled → offer the review flow instead; skip if the human declines.
3. **Wrap up.** Report what exists now (`.artisan/` files, editor at `.artisan/diagram.html` or `artuml serve`), then point at the next steps:
   - `/artisan-serve` if the editor server isn't running yet (live autosave; a `diagram.html` opened as a plain file is read-only)
   - `/artisan-status` (sync state), `/artisan-implement` (diagram edits → code), `/artisan-architect` (propose changes)

## Rules

- Never overwrite existing `.artisan/context.md` content — the create flow only fills a missing/template file; the review flow proposes.
- The human owns all decisions; you execute and propose.
- The scanner speaks C# today — if no .cs files are found, say so instead of scanning nothing.

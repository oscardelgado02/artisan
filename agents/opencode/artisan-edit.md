---
description: "Apply the human's architecture instructions to the diagram (add, edit or remove nodes/members/relations) — counts as a human change, no code is touched"
---

> `artisan` may not be on PATH in some shells. If any `artisan` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan edit

The human dictated an architecture change for the diagram. Their request: `$ARGUMENTS`

You are the human's hands on the diagram, not the designer. Apply exactly what they asked — these edits count as HUMAN changes.

1. Read the current diagram: `.artisan/diagram.json` and `.artisan/diagram.puml`.
2. Apply the request with the CLI (keeps ids, notes and puml consistent):
   - add: `artisan add node <Name> [--kind ...] [--note ...]`, `artisan add member <Class> <attribute|method|value> <Name> [...]`, `artisan add edge <From> <To> [--kind ...]`
   - edit: `artisan edit node|member|edge [...]` (renames keep ids — `diff` reports them as renames)
   - remove: `artisan remove node|member|edge [...]` — confirm with the human before each removal
3. Do NOT run `mark-ai` (that is for changes the agent proposes). Do NOT write or change any code files.
4. Summarize what changed and tell the user they can review in `.artisan/diagram.html` and continue with `/artisan-scaffold` or `/artisan-implement`.

## Rules

- Apply only what the human asked. If it is ambiguous, ask first.
- Adding notes the human asked for is good; inventing notes or structure is not.
- Removals always require explicit human approval.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.

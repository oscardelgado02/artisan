---
description: "Recover control of your architecture — scan code to a class diagram, scaffold or implement diagram edits back into code, or ask for architecture changes"
---

# Artisan — architecture control for agents

Argument: `$ARGUMENTS` — one of `scan`, `scaffold`, `implement`, `architect`, `status`.
No argument or unknown argument → show the list below and ask which one.

The human owns the architecture. You propose and execute — the diagram decides.
CLI reference: `artisan` (from the `artisan-uml` npm package; use `npx artisan-uml` if not installed globally).

## scan — "show me the architecture"

1. Run `artisan scan` in the project root.
2. Read `.artisan/diagram.puml` — that is the current architecture (classes, members, relations, and any human-written `note`s).
3. Tell the user: "Diagram ready — run `artisan serve` and open http://localhost:4173 to view/edit it."
4. Summarize the architecture in a few sentences. Honor all notes (class notes, member notes, project notes) — they are the human's instructions.

## scaffold — "turn my diagram edits into code"

1. Run `artisan diff`. It prints a markdown change report (human's diagram edits since last time, with renames detected as renames) and consumes it.
2. Apply the report to the C# code:
   - **renames**: rename the class/member (refactor call sites).
   - **added**: create the new class/member as a stub (empty or `throw new NotImplementedException()` bodies).
   - **modified**: change only the signature parts that differ. If the class/attribute/method already exists, DO NOT modify it beyond what the report says.
   - **removed**: NEVER delete code on your own — ask the human first.
   - **notes**: every note in the report is a binding instruction from the human.
3. Report what you did, file by file.

## implement — "write the actual code"

Same as scaffold (run `artisan diff` first), but write real method bodies instead of stubs.
Follow every note as the spec. If a body needs decisions the diagram doesn't answer, ask — don't invent architecture.

## architect — "propose an architecture change"

The human asked you to modify the architecture with their input: `$ARGUMENTS` (the rest of the message after "architect" is their request).

1. Read the current diagram: `.artisan/diagram.json` (structure) and `.artisan/diagram.puml`.
2. Edit `.artisan/diagram.json` DIRECTLY to express the proposed architecture (add/change/remove nodes, edges, members — set `note` fields to explain why). Keep existing node `id`s and positions where possible.
3. Run `artisan mark-ai`.
4. Tell the user: "Proposed architecture is in the editor (amber highlights) — run `artisan serve`, review, adjust, then confirm with Mark seen. Nothing in the code changes until you say scaffold/implement."
5. DO NOT write or change any code files in architect mode.

## status

Run `artisan status` and relay the result: diagram size, pending AI changes the human hasn't seen, unconsumed human changes.

## Rules for all commands

- The human's diagram edits and notes always win over your preferences.
- Never modify or delete an existing class/member unless the diff report lists it.
- Removals are always confirmed by the human first.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.

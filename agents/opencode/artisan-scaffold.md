---
description: "Turn the human's diagram edits into code scaffolds — artuml scaffold does the mechanical work, agent handles call sites and judgement calls"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan scaffold

Apply the human's diagram edits to the project's code as stubs. Argument (optional): `$ARGUMENTS`

The human owns the architecture. You execute what the diagram says — nothing more.

1. Run `artuml diff`. It prints a markdown change report (the human's diagram edits since last time, with renames detected as renames) and consumes it.
2. Run `artuml scaffold`. It applies the mechanical diagram-to-code mapping itself and refreshes `impl-diff.json` when done:
   - **created**: stub files for diagrammed-but-missing classes, stub members spliced into existing files (body style from the `stubBody` config; diagram notes emitted as `// NOTE:` comments above the stub).
   - **patched**: signature mismatches — only the differing parts change.
   - **renamed**: applied silently — for a class the file (sole-type files), the declaration and in-file member identifiers; for a member its identifier in its own file.
   - **moved**: files relocated when a node's directory (`dir`) was edited — sole-type files only.
   - **removed**: code in the project that the diagram no longer declares. The command prompts once and removes with your approval; in a non-interactive shell it removes nothing and lists everything.
3. Handle what needs judgement, from the scaffold report:
   - **Renames**: refactor call sites outside the renamed file (only listed there — the mechanic does not touch other files).
   - **Declined removals / code not in the diagram**: do not adopt silently. Ask the human once (removal rule below); if they confirm, rerun `artuml scaffold --yes` to complete the removals.
   - **Manual moves**: shared multi-type files are listed for hand-moving — move them, keeping one type per file where practical.
   - **Namespace drift**: after a move, the folder/namespace mismatch is reported — align it, or ask the human.
4. Report what you did, file by file.

## Removals — always one prompt, never silent

Code the diagram no longer declares is only removed through the CLI's own single prompt. Never delete such code by hand.

- `artuml scaffold` (interactive shell) prompts once, listing every candidate; proceed only after a yes.
- In agent shells (non-interactive) it removes nothing and lists the candidates — relay them to the human exactly once, in this style:

> The following code is in the project but no longer in the diagram. Remove it by rerunning `artuml scaffold --yes`?
> - `src/Wolf.cs` — class `Wolf`
> - `src/Dog.cs` — member `Bark`

If the human confirms, rerun `artuml scaffold --yes` (add `--src` if you used it before). Never rerun with `--yes` without an explicit human yes.

Config: project `.artisan/config.json` wins, global fallback — exact keys and paths: load the `artisan-cli` skill.

## Rules

- Never modify or delete an existing class/member unless the scaffold or diff report lists it.
- The scaffold's stubs are placeholders; for real method bodies the human runs `/artisan-implement`.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.

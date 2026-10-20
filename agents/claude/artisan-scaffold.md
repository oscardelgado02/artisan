---
description: "Turn the human's diagram edits into code scaffolds (stubs) — renames detected, existing code never clobbered"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan scaffold

Apply the human's diagram edits to the project's code as stubs. Argument (optional): `$ARGUMENTS`

The human owns the architecture. You execute what the diagram says — nothing more.

1. Run `artuml diff`. It prints a markdown change report (the human's diagram edits since last time, with renames detected as renames) and consumes it. Then run `artuml mark-ai`.
   Then run `artuml impl-diff` — it compares the diagram against the actual code (read-only):
   - **In the diagram, missing from the code**: scaffold these too (the regular diff misses them once acked or scanned out-of-band).
   - **In the code, not in the diagram**: do not adopt silently — list these and ask the human (drift or a diagram edit still pending).
   - **Signature mismatches**: change only the differing signature parts in the code to match the diagram.
2. Apply the report to the code:
   - **renames**: rename the class/member and refactor call sites.
   - **added**: create the new class/member as a stub (empty or `throw new NotImplementedException()` bodies).
   - **modified**: change only the signature parts that differ. If the class/attribute/method already exists, DO NOT modify it beyond what the report says.
   - **removed**: NEVER delete code on your own — see the removal rule below.
   - **notes**: every note in the report is a binding instruction from the human.
3. Report what you did, file by file.

## Removals — always one prompt, never silent

If the reports list classes/members to remove: collect ALL of them first, then — unless `.artisan/config.json` sets `"askBeforeRemove": false` (check also the global `~/.config/artuml/config.json`; the project file wins) — ask the human exactly once, in this style:

> The following classes will be removed. Do you want to continue?
> - `Wolf`
> - `Inventory`

Proceed only after a yes. With `askBeforeRemove: false`, remove without asking.

Config: project `.artisan/config.json` wins, global fallback — exact keys and paths: load the `artisan-cli` skill.

## Rules

- Never modify or delete an existing class/member unless the diff report lists it.
- For real method bodies instead of stubs, the human runs `/artisan-implement`.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.

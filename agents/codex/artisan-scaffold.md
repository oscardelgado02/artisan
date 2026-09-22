---
description: "Turn the human's diagram edits into code scaffolds (stubs) — renames detected, existing code never clobbered"
---

> `artisan` may not be on PATH in some shells. If any `artisan` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# Artisan scaffold

Apply the human's diagram edits to the C# code as stubs. Argument (optional): `$ARGUMENTS`

The human owns the architecture. You execute what the diagram says — nothing more.

1. Run `artisan diff`. It prints a markdown change report (the human's diagram edits since last time, with renames detected as renames) and consumes it.
   Then run `artisan impl-diff` — it compares the diagram against the actual code (read-only):
   - **In the diagram, missing from the code**: scaffold these too (the regular diff misses them once acked or scanned out-of-band).
   - **In the code, not in the diagram**: do not adopt silently — list these and ask the human (drift or a diagram edit still pending).
   - **Signature mismatches**: change only the differing signature parts in the code to match the diagram.
2. Apply the report to the C# code:
   - **renames**: rename the class/member and refactor call sites.
   - **added**: create the new class/member as a stub (empty or `throw new NotImplementedException()` bodies).
   - **modified**: change only the signature parts that differ. If the class/attribute/method already exists, DO NOT modify it beyond what the report says.
   - **removed**: NEVER delete code on your own — ask the human first.
   - **notes**: every note in the report is a binding instruction from the human.
3. Report what you did, file by file.

## Rules

- Never modify or delete an existing class/member unless the diff report lists it.
- Removals are always confirmed by the human first.
- For real method bodies instead of stubs, the human runs `/artisan-implement`.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.

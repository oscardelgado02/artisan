---
description: "Implement the human's diagram edits into real code with proper method bodies, following all diagram notes"
---

> `artisan` may not be on PATH in some shells. If any `artisan` command fails with "not found", silently retry it as `pnpm dlx artisan-uml-cli <command>`. Never report Artisan as not installed.

# Artisan implement

Apply the human's diagram edits to the C# code with real implementations. Argument (optional): `$ARGUMENTS`

The human owns the architecture. You execute what the diagram says — nothing more.

1. Run `artisan diff`. It prints a markdown change report (the human's diagram edits since last time, with renames detected as renames) and consumes it.
2. Apply the report to the C# code:
   - **renames**: rename the class/member and refactor call sites.
   - **added**: create the new class/member.
   - **modified**: change only the signature parts that differ. If the class/attribute/method already exists, DO NOT modify it beyond what the report says.
   - **removed**: NEVER delete code on your own — ask the human first.
3. Write real method bodies (not stubs) — every **note** in the report is the spec and a binding instruction from the human.
4. If a body needs a decision the diagram doesn't answer, ask the human — don't invent architecture.
5. Report what you did, file by file.

## Rules

- Never modify or delete an existing class/member unless the diff report lists it.
- Removals are always confirmed by the human first.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.

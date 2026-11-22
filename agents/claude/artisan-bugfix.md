---
description: "Fix a bug the artisan way — diagnose first, propose the fix and any diagram change, wait for approval, then write the fix"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

> **Artisan asks:** surface every question to the human through the harness's own question UI (options / multiple-choice / free text) when it has one, and include 🎨 in the question text so it's identifiable as an artisan ask; if no question UI is available, start the question line with 🎨❓ so it stands out at a glance.

# Artisan bugfix

The human reported a bug. Their report: `$ARGUMENTS`

The human owns the fix. You diagnose and propose first — you write code only after approval.

1. Reproduce/locate: read the code paths involved and `.artisan/diagram.json` / `.artisan/diagram.puml` (the intended structure). Pin down what's wrong and where.
2. Explain, in this order: the bug (what's wrong, where), the root cause, then the solution you believe will work — plain words before any diagram.
3. Show the resulting diagram change: if the fix adds or changes types/members, express it through the CLI commands (`artuml add/edit node|member|edge ...`, `--note` explains why), then `artuml mark-ai` so it queues as amber pending. If the fix needs no diagram change, say so explicitly.
4. Ask: `🎨 Tell me when you've checked it`, and WAIT for confirmation (Mark seen in the editor, `artuml ack`, or a reply). No code is written before that.
5. After approval: if the diagram changed, run `artuml scaffold` to apply it, then write the fix with real bodies (notes are binding), refactor call sites, and report what you did, file by file.

## Rules

- Diagnose before code: no file edits before step 4's confirmation.
- Never hand-create a class or member the diagram doesn't declare — propose it in the diagram (step 3) and wait.
- The human's diagnosis or direction always wins over yours — if they name the cause, follow it.
- Propose once per question; don't re-ask what they declined.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.

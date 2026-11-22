---
description: "Create or review .artisan/context.md — the project intent doc (Overview, Glossary, Requirements, Invariants, Roadmap, Non-goals) that the other packs read before proposing or implementing"
---

> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

> **Artisan asks:** surface every question to the human through the harness's own question UI (options / multiple-choice / free text) when it has one, and include 🎨 in the question text so it's identifiable as an artisan ask; if no question UI is available, start the question line with 🎨❓ so it stands out at a glance.

# Artisan context

Create or update `.artisan/context.md` — the human-authored intent doc. Task (optional): `$ARGUMENTS`

The human owns this file. You propose; they approve every line.

## Pick the mode

- `.artisan/context.md` missing + `.artisan/diagram.json` exists → **create** (draft from the diagram).
- `.artisan/context.md` missing + no diagram → **create** (conversation only — suggest `/artisan-scan` or `/artisan-set-up` afterwards for structure).
- `.artisan/context.md` exists → **review**.

## Create

1. Read `.artisan/diagram.json` / `.artisan/diagram.puml` if present: pre-draft the Overview (what the project is) and Glossary (one term per diagram node name) from real node names.
2. Walk the sections in order — Overview, Glossary, Requirements (`- R1: ...`), Invariants, Roadmap (Now / Next / Later), Non-goals:
   - Propose as a question, never a recommendation: `🎨 Should the Overview say ...? Here's a draft:` — attach the draft, the human edits/approves; write it to the file before moving on.
   - Every section is optional except Overview — skip what the human doesn't want.
   - Ask follow-ups a form can't: "who is this for?", "what must never happen?"
3. Keep the doc to exactly those six `##` sections — no extras.
4. Code conventions (style, formatting, patterns) do NOT belong here — they live in AGENTS.md / CLAUDE.md. Decline politely and point there.

## Review

1. Read the file. Walk section by section: for each, ask keep / edit / rewrite as a question. Never silently rewrite human prose — ask, human approves.
2. Reconcile against the current diagram (`artuml diff --peek` + `.artisan/diagram.json`):
   - node names missing from the Glossary → ask `🎨 Should the Glossary name X as "..."? Here's a draft line: ...`
   - Glossary terms with no node anymore → flag
   - Invariants that contradict the diagram → surface
   - Roadmap "Now" items already reflected in the diagram → suggest moving them on
3. Apply only approved changes; leave everything else untouched.

## Rules

- The human's word always wins over your drafts.
- Proposals are questions, not recommendations — draft attached, human approves or edits before anything is written.
- Propose once per question; don't re-ask what they declined.
- If `$ARGUMENTS` names a section, work on that section only.

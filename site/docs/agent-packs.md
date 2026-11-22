# Agent packs

Nine workflow slash commands, identical in opencode, Claude Code and Codex, plus
an `artisan-cli` skill (opencode) holding the CLI reference:

| Command | What it does |
| --- | --- |
| `/artisan-set-up` | day zero: scan the project into `.artisan/` and create `.artisan/context.md` in one guided pass |
| `/artisan-scan` | scan the code into a class diagram, open it in the editor, summarize the architecture (scanner speaks C# only today — see the `artisan-cli` skill's language note) |
| `/artisan-serve` | serve the editor at `localhost:4173` with live autosave to `diagram.json` (the Firefox/Safari path — no Connect file there) |
| `/artisan-context` | create or review `.artisan/context.md` — the project intent doc (Overview, Glossary, Requirements, Invariants, Roadmap, Non-goals) the other packs read; every proposal arrives as a question with a draft attached |
| `/artisan-scaffold` | run `artuml scaffold` after `diff`: the CLI does the mechanical work (stub classes, member splices, signature patches, renames, moves, one gated removal prompt), the agent finishes what needs judgement — call sites, real bodies per notes |
| `/artisan-implement` | same, plus real method bodies following your notes; if the code seems to need classes/methods beyond the diagram, it proposes the diagram change and waits for your approval |
| `/artisan-architect` | the agent proposes an architecture change directly in the diagram; you review the amber highlights |
| `/artisan-bugfix` | for bug reports: the agent diagnoses first, explains the root cause, proposes the fix (and any diagram change as amber pending), waits for your approval — only then writes the fix |
| `/artisan-status` | report pending changes in both directions and who made them |

`.artisan/context.md` is the human-authored intent doc: `artuml scan` seeds it
as a template once (the tool never rewrites it), `/artisan-set-up` and
`/artisan-context` fill or review it with you, and the other packs read it —
architect/implement/scaffold follow its Requirements and Invariants (cited in
their output, e.g. "follows R2"), and five packs propose Glossary updates when
the diagram's node names change. Proposals only — the packs never edit it.

The `artisan-cli` reference ships as a **skill**, not a slash command: repo
source `skills/artisan-cli/SKILL.md`, installed to
`~/.config/opencode/skills/artisan-cli/`.

## Install

One command (published to npm as [`artisan-agent`](https://www.npmjs.com/package/artisan-agent)):

```bash
npx artisan-agent install
```

Or copy the files by hand:

| Tool | Copy from | To (global) | To (per project) |
| --- | --- | --- | --- |
| opencode | `agents/opencode/artisan-*.md` | `~/.config/opencode/commands/` | `.opencode/commands/` |
| Claude Code | `agents/claude/artisan-*.md` | `~/.claude/commands/` | `.claude/commands/` |
| Codex | `agents/codex/artisan-*.md` | `~/.codex/prompts/` | — |

The packs need the CLI available: `pnpm add -g artisan-uml-cli` (or use
`pnpm dlx artisan-uml-cli <command>` anywhere).

## Any other agent

Not on opencode, Claude Code or Codex? Cursor, Windsurf, Gemini CLI, Aider, a
shell script, anything that can run commands — they all work, because Artisan is
just files in your project. No plugin, no MCP, no integration needed.

**1. Install the CLI**

```bash
pnpm add -g artisan-uml-cli
# or: npm install -g artisan-uml-cli
```

**2. Scan your project**

```bash
cd your-unity-project
artuml scan
```

You get `.artisan/diagram.html` (the editor, for you) and `.artisan/diagram.puml`
(the architecture mirror, for the agent).

**3. Tell your agent the rules (once)**

Copy this into your agent's rules file, memory, or a `.cursorrules`-style file —
or just paste it at the start of a session:

> This project uses Artisan for architecture. The class diagram lives in
> `.artisan/diagram.json`; read `.artisan/diagram.puml` to see the architecture.
> If `.artisan/context.md` exists, read it first — it holds the project intent,
> requirements and invariants that bind your proposals and code.
> - To see my design changes: run `artuml diff`, then `artuml scaffold` — the
>   CLI applies the mechanical work (stubs, renames, patches, moves; removals
>   are gated, never delete anything by hand). Finish only the judgement items:
>   call sites of renamed classes, real method bodies, anything listed under
>   *For the agent*. Honor every note.
> - If you propose architecture changes: edit `.artisan/diagram.json`, run
>   `artuml mark-ai`, and wait for my confirmation.
> - I design the architecture; you implement it. Ask before anything destructive.

**4. Work the loop**

You redesign in the editor → `artuml diff` + `artuml scaffold` do the mechanical
work → the agent finishes the judgement calls → its own architecture proposals
come back as amber highlights for you to confirm. Same loop, any agent.

## Pack rules

Every pack ends with the same ground rules:

- The human's diagram edits and notes always win.
- Work in the project's stack and follow its conventions — today the scanner supports C# only; the diagram is the source of architectural truth.
- The human decides the architecture, the agent implements it.
- Anything destructive requires explicit human approval.
- Questions go through the harness's own question UI (options / multiple-choice / free text) with 🎨 in the question text; when no question UI exists, the line starts with 🎨❓ — artisan asks are always identifiable.
- `.artisan/context.md` is human-authored: packs read it and propose Glossary updates; only `/artisan-context`, `/artisan-set-up` and you change it.

# Agent packs

Six slash commands, identical in opencode, Claude Code and Codex:

| Command | What it does |
| --- | --- |
| `/artisan-scan` | scan the code into a class diagram, open it in the editor, summarize the architecture |
| `/artisan-scaffold` | turn your diagram edits into code stubs: renames refactored, new types scaffolded, existing members untouched |
| `/artisan-implement` | same, plus real method bodies following your notes |
| `/artisan-architect` | the agent proposes an architecture change directly in the diagram; you review the amber highlights |
| `/artisan-edit` | the agent applies your dictated architecture changes to the diagram (add/edit/remove) — counted as human edits |
| `/artisan-status` | report pending changes in both directions and who made them |

## Install

From this repo:

```bash
./install.sh
```

Or copy the files by hand:

| Tool | Copy from | To (global) | To (per project) |
| --- | --- | --- | --- |
| opencode | `agents/opencode/artisan-*.md` | `~/.config/opencode/command/` | `.opencode/command/` |
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
artisan scan
```

You get `.artisan/diagram.html` (the editor, for you) and `.artisan/diagram.puml`
(the architecture mirror, for the agent).

**3. Tell your agent the rules (once)**

Copy this into your agent's rules file, memory, or a `.cursorrules`-style file —
or just paste it at the start of a session:

> This project uses Artisan for architecture. The class diagram lives in
> `.artisan/diagram.json`; read `.artisan/diagram.puml` to see the architecture.
> - To see my design changes: run `artisan diff` and follow the markdown report.
>   Refactor renames, scaffold additions, honor the notes, and never modify
>   existing members or delete anything without asking me.
> - To implement: write the code the report describes, following every note.
> - If you propose architecture changes: edit `.artisan/diagram.json`, run
>   `artisan mark-ai`, and wait for my confirmation.
> - I design the architecture; you implement it. Ask before anything destructive.

**4. Work the loop**

You redesign in the editor → `artisan diff` tells the agent → it codes → its own
architecture proposals come back as amber highlights for you to confirm. Same
loop, any agent.

## Pack rules

Every pack ends with the same ground rules:

- The human's diagram edits and notes always win.
- C# only in v1 (Unity-friendly); the diagram is the source of architectural truth.
- The human decides the architecture, the agent implements it.
- Anything destructive requires explicit human approval.

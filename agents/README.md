# Agent packs

`/artisan-*` chat commands for each agentic tool. Same six commands everywhere:

| Command | What it does |
|---------|--------------|
| `/artisan-scan` | scan code → class diagram + PlantUML, open in editor |
| `/artisan-scaffold` | your diagram edits → code stubs (renames detected, existing code untouched) |
| `/artisan-implement` | your diagram edits → real code with bodies, per notes |
| `/artisan-architect` | AI proposes an architecture change in the diagram (amber highlights); you review |
| `/artisan-edit` | your spoken architecture changes applied to the diagram (add/edit/remove, counted as human edits) |
| `/artisan-status` | who changed what, what's pending |

| Tool | Pack | Install (project root) |
|------|------|------------------------|
| opencode | `agents/opencode/artisan-*.md` | copy to `~/.config/opencode/command/` (global) or `.opencode/command/` (per project) |
| Claude Code | `agents/claude/artisan-*.md` | copy to `~/.claude/commands/` (global) or `.claude/commands/` (per project) |
| Codex | `agents/codex/artisan-*.md` | copy to `~/.codex/prompts/` |

```bash
./install.sh   # or copy the files manually as shown above
```

Also install the CLI once: `pnpm add -g artisan-uml-cli` (or `npm install -g
artisan-uml-cli`). Without a global install, any pack can fall back to
`npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`.

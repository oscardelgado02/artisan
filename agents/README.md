# Agent packs

`/artisan-*` chat commands for each agentic tool. Same five commands everywhere:

| Command | What it does |
|---------|--------------|
| `/artisan-scan` | scan code → class diagram + PlantUML, open in editor |
| `/artisan-scaffold` | your diagram edits → code stubs (renames detected, existing code untouched) |
| `/artisan-implement` | your diagram edits → real code with bodies, per notes |
| `/artisan-architect` | AI proposes an architecture change in the diagram (amber highlights); you review |
| `/artisan-status` | who changed what, what's pending |

| Tool | Pack | Install (project root) |
|------|------|------------------------|
| opencode | `agents/opencode/artisan-*.md` | copy to `~/.config/opencode/command/` (global) or `.opencode/command/` (per project) |
| Claude Code | `agents/claude/artisan-*.md` | copy to `~/.claude/commands/` (global) or `.claude/commands/` (per project) |
| Codex | `agents/codex/artisan-*.md` | copy to `~/.codex/prompts/` |

```bash
# from the repo root
mkdir -p ~/.config/opencode/command && cp agents/opencode/artisan-*.md ~/.config/opencode/command/
mkdir -p ~/.claude/commands && cp agents/claude/artisan-*.md ~/.claude/commands/
```

Also install the CLI once: `npm install -g artisan-uml` (or `pnpm add -g artisan-uml`).

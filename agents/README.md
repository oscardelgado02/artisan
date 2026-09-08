# Agent packs

One `/artisan` chat command for each agentic tool. Same behavior everywhere.

| Tool | Pack | Install (project root) |
|------|------|------------------------|
| opencode | `agents/opencode/artisan.md` | copy to `.opencode/command/artisan.md` |
| Claude Code | `agents/claude/artisan.md` | copy to `.claude/commands/artisan.md` |
| Codex | `agents/codex/artisan.md` | copy to `~/.codex/prompts/artisan.md` |

```bash
# from the repo root, inside your project
mkdir -p .opencode/command && cp agents/opencode/artisan.md .opencode/command/
mkdir -p .claude/commands && cp agents/claude/artisan.md .claude/commands/
```

Then in chat:

- `/artisan scan` — scan code → class diagram + PlantUML, open in editor
- `/artisan scaffold` — apply your diagram edits to code as stubs
- `/artisan implement` — apply your diagram edits with real bodies
- `/artisan architect <request>` — AI proposes an architecture change in the diagram (amber highlights), you review it
- `/artisan status` — who changed what, what's pending

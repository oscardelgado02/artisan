# Agent packs

`/artisan-*` chat commands for each agentic tool. Eight everywhere:

| Command | What it does |
|---------|--------------|
| `/artisan-set-up` | day-zero: scan the project + create `.artisan/context.md` in one guided pass |
| `/artisan-scan` | scan code → class diagram + PlantUML, open in editor (scanner speaks C# today; see the CLI reference for language support) |
| `/artisan-serve` | serve the editor at localhost:4173 with live autosave (for Firefox/Safari, no Connect file) |
| `/artisan-context` | create or review `.artisan/context.md` — the project intent doc (Overview, Glossary, Requirements, Invariants, Roadmap, Non-goals) that the other packs read |
| `/artisan-scaffold` | your diagram edits → code stubs (renames detected, existing code untouched) |
| `/artisan-implement` | your diagram edits → real code with bodies, per notes |
| `/artisan-architect` | AI proposes an architecture change in the diagram (amber highlights); you review |
| `/artisan-status` | who changed what, what's pending |

`.artisan/context.md` is the human-authored intent doc: `/artisan-set-up` and
`/artisan-context` write it (every line human-approved), and
`/artisan-scan`, `/artisan-scaffold`, `/artisan-implement`, `/artisan-architect`
and `/artisan-status` read it and propose Glossary updates when the diagram's
node names change. `artuml scan` seeds it as a template once; the tool never
rewrites it afterwards.

**Question marker:** every question an agent asks during an artisan flow goes
through the harness's own question UI with a 🎨 in the text (artisan's ask);
when no question UI is available, the question line starts with 🎨❓ instead.

Plus an `artisan-cli` **skill** (not a command): an `artuml` reference — commands,
flags, config paths and precedence, `.artisan` file roles — that opencode loads
automatically when running or debugging commands. Repo source:
`skills/artisan-cli/SKILL.md`, installed to `~/.config/opencode/skills/artisan-cli/`.

| Tool | Pack | Installed by |
|------|------|--------------|
| opencode | `agents/opencode/artisan-*.md` | `~/.config/opencode/commands/` (global) or `.opencode/commands/` (per project) |
| Claude Code | `agents/claude/artisan-*.md` | `~/.claude/commands/` (global) or `.claude/commands/` (per project) |
| Codex | `agents/codex/artisan-*.md` | `~/.codex/prompts/` |

```bash
npx artisan-agent install            # detects your tools, installs CLI + packs
npx artisan-agent install --project  # per-project copies instead
npx artisan-agent install --tool opencode,claude,--all
npx artisan-agent list              # what is installed where
npx artisan-agent uninstall         # remove the copied packs
```

Or copy the files manually as shown in the table above.

Also install the CLI once: `pnpm add -g artisan-uml-cli` (or `npm install -g
artisan-uml-cli`). The installer does it for you when `artuml` is not on PATH;
without it, any pack can fall back to
`npx --yes artisan-uml-cli <command>` (or `pnpm dlx artisan-uml-cli <command>`).

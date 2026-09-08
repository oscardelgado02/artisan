# Artisan — take your architecture back from the AI

You and an AI agent build a codebase together. Within a week, nobody — including the AI — knows how it fits together. **Artisan** fixes that with a small, fast class-diagram editor that both you and the AI speak:

- You draw **the architecture** and leave notes the AI must honor.
- The AI **reads** the diagram (JSON + PlantUML) before touching code.
- Your diagram edits become code — renames detected as renames, existing code never clobbered.
- The AI proposes architecture changes in the diagram; **you** review them, amber-highlighted, and confirm.

Architecture decisions are made by a human, on a canvas — not inferred from a chat log.

## Install

```bash
npm install -g artisan-uml   # or: npx artisan-uml@latest
```

C# first (Unity-friendly), more languages later.

## The 60-second tour

```bash
cd your-project
artisan scan     # C# → .artisan/diagram.json + diagram.puml (PlantUML mirror)
artisan serve    # open http://localhost:4173 — view & edit the diagram
```

Edit the diagram (rename things, add classes, leave notes), then let your agent run `/artisan scaffold` or `/artisan implement` — diagram edits land in your code:

- **renames** are detected as renames and refactored
- **existing** classes/members are never modified beyond what you changed
- **removals** are always confirmed by you first
- every **note** (class, member, project level) is a binding instruction for the AI

Ask for architecture work with `/artisan architect <request>`: the AI edits the diagram, you review the amber highlights in the editor, you decide.

## The `/artisan` chat command

One slash command for opencode, Claude Code and Codex — see [agents/](agents/):

```
/artisan scan        scan code → diagram
/artisan scaffold    diagram edits → code stubs
/artisan implement   diagram edits → real code
/artisan architect   AI proposes changes; you review in the editor
/artisan status      what changed, what's pending
```

## How tracking works, both directions

| Direction | Mechanism |
|-----------|-----------|
| You → AI | `artisan diff` — a markdown report of your diagram edits the agent applies |
| AI → you | `artisan mark-ai` — AI proposals show as amber highlights; you "Mark seen" |

## Packages

| Path | What |
|------|------|
| [`cli/`](cli/) | `artisan` — zero-dependency CLI: scan, serve, diff, mark-ai, ack, status |
| [`editor/`](editor/) | the diagram editor — Vite + TypeScript, no framework, ~37 kB JS |
| [`agents/`](agents/) | `/artisan` command packs for opencode, Claude Code, Codex |

## Repo layout for development

```bash
pnpm install
pnpm test    # CLI self-checks (parser, diff engine, scan flow)
pnpm build   # typecheck + build the editor
```

## License & support

MIT. If Artisan saves your architecture, [sponsor the project](.github/FUNDING.yml) — every cent goes into more language packs.

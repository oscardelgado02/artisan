---
name: artisan-cli
description: "artuml (artisan-uml-cli) command reference — commands, flags, config paths and precedence, .artisan file roles. Load when running, reading, or debugging any artisan command or .artisan file."
---
> `artuml` may not be on PATH in some shells. If any `artuml` command fails with "not found", silently retry it as `npx --yes artisan-uml-cli <command> (or pnpm dlx artisan-uml-cli <command>)`. Never report Artisan as not installed.

# artuml CLI reference

This skill is a reference, not a workflow — the workflow packs (`/artisan-scan`, `/artisan-serve`, `/artisan-scaffold`, `/artisan-implement`, `/artisan-architect`, `/artisan-status`) tell you *when* to run what. Load this one when you need exact flags, config paths, or file semantics.

## Commands

Run in the project root (the directory that owns `.artisan/`).

| Command | Notes |
|---------|-------|
| `artuml scan [--src DIR]` | parse code → `.artisan/`; merges with prior diagram (ids stable); seeds `config.json`; editor copy requires network only on first install |
| `artuml serve [--port N]` | live editor at `localhost:4173` (default); autosave PUTs to `diagram.json`; spawn with `ARTISAN_NO_BROWSER=1` to skip opening a browser |
| `artuml diff [--json] [--peek]` | human changes since AI last looked. Consuming: advances `last-ai.json`. `--peek`: prints the same report, advances nothing — use in status-style checks |
| `artuml impl-diff` | diagram vs actual code (read-only); missing-from-code → implement, code-not-in-diagram → ask human |
| `artuml scaffold [--src DIR] [--json] [--yes]` | apply the impl-diff result to code mechanically: create stubs, patch signatures, silent renames, `dir` moves, gated removals (one prompt; `--yes` to skip it; non-TTY without `--yes` removes nothing and lists). Refreshes `impl-diff.json`. See `artuml help scaffold` |
| `artuml config [key] [value]` | read config (no args = all keys, key = one value) or set `$artuml config key value` (validates; writes the project file) |
| `artuml mark-ai` | call after the AGENT edits the diagram (CLI edits or last-resort direct edit): queues its changes as amber `pending` refs for human review AND records them as AI-known — then the next `diff` never misreports them as human changes |
| `artuml ack [keys...]` | human confirmed pending changes (or the editor's "Mark seen" button) |
| `artuml reject [keys...]` | human reverted pending AI changes |
| `artuml status` | tree sizes + unseen human changes (shown as a peek, always non-consuming) + first pending refs |
| `artuml add/edit/remove node\|member\|edge ...` | surgical CLI edits (human-attributed). `add/edit node` take `--dir PATH` (project-root-relative placement for `scaffold`; on `edit`, `--dir` with no value clears it). See `artuml help edit` |
| `artuml editor` / `artuml app` | build/open embedded editor |
| `artuml help [topic]` | topics: scan, serve, diff, impl-diff, scaffold, config, mark-ai, ack, status, add, edit, remove, editor |

## Config

Two JSON files, deep-merged — **project wins over global** over built-in defaults:

| File | Scope | Written by |
|------|-------|-----------|
| `.artisan/config.json` | this project | `scan` seeds it with defaults if missing; edit freely |
| `~/.config/artuml/config.json` | the machine | you, by hand |

Keys: `askBeforeRemove` (default `true` — scaffold prompts before removing code; `false` removes without asking), `autoServe` (default `false` — when `true`, every `artuml` command ensures the editor server is running on port 4173), `scaffoldDir` (default `''` — seeded by `scan` to the `--src` root; default directory for scaffold-created class files), `stubBody` (default `"throw"` — scaffold method stub bodies: `"throw"` = `throw new NotImplementedException();`, `"empty"` = `{ }`, `"todo"` = `// TODO: scaffold` body). Nodes also carry an optional per-node `dir` (project-root-relative) that overrides `scaffoldDir` for that type and can move its file via `artuml scaffold`.

Read config as `JSON.parse(fs.readFileSync('.artisan/config.json'))` with a fallback to the global file — or just look it up before deciding; do not create config files outside `artuml scan`.

## `.artisan/` files

| File | Role |
|------|------|
| `diagram.json` | source of truth; the editor autosaves here |
| `diagram.puml` | PlantUML mirror for quick reading |
| `last-ai.json` | baseline of what the AI last consumed/produced — `diff` compares against it |
| `last-human.json` | baseline of what the human last acked — `mark-ai` compares against it |
| `pending.json` | amber refs awaiting human review (AI + human edits both) |
| `config.json` | settings (see Config) |
| `impl-diff.json` | last impl-diff summary badge; also embedded in `diagram.html` |
| `impl-diff` note | scaffold consumes and refreshes this file; it never touches `last-ai.json`/`pending.json` |
| `diagram.html`, `editor/` | self-contained editor |

## Language support

The scanner speaks **C#** only today (Unity-friendly). Work in whatever stack
the project actually has for code edits; only the automatic diagram extraction
is C#-only — a new language plugs into the CLI's shared extractor
(`lib/extract.mjs`).

## Rules of engagement

- Only `diff` (without `--peek`) consumes the human-change report. `--peek` and `status` never change state.
- AI diagram edits → run `artuml mark-ai` right after.
- Direct edits to `diagram.json` are a last resort — prefer `add`/`edit`/`remove` and the editor.

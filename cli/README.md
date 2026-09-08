# artisan-uml — CLI

Zero-dependency Node CLI (≥18) that keeps code and a class diagram in sync.
The `.artisan/` directory in your project holds the state:

| File | Meaning |
|------|---------|
| `diagram.json` | source of truth (nodes, edges, notes, positions) |
| `diagram.puml` | PlantUML mirror — what the AI reads |
| `map.json` | type → source file |
| `last-ai.json` / `last-human.json` | change-tracking baselines |
| `pending.json` | AI changes the human hasn't seen yet |
| `changelog.json` | history of consumed changes |
| `editor/` | bundled diagram editor (served by `artisan serve`) |

## Commands

```
artisan scan        parse C# → diagram (merges your edits: positions, notes survive)
artisan serve       editor at http://localhost:4173 (autosaves to diagram.json)
artisan diff        human diagram edits → markdown report for the AI; consumes them
artisan mark-ai     record AI-made diagram.json edits as pending (amber in editor)
artisan ack         human confirms AI changes seen (or "Mark seen" button in editor)
artisan status      diagram size, pending changes both directions
```

Scan skips `Library/`, `obj/`, `bin/`, `Temp/`, `Logs/`, `Packages/`, `Editor/` test dirs? — see `lib/scan.mjs` for the current ignore list (Unity-aware).

## Install into a project

```bash
npm install -g artisan-uml
artisan scan
```

## Development

```bash
node cli/test/run.mjs    # self-checks: C# parser, diff engine, scan flow
node cli/bin/artisan.mjs help
```

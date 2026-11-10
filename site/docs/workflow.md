# The workflow

One loop, two sides. The human designs, the agent implements, and `artuml` tracks
every change in both directions.

```text
   your code                    the diagram
      │                             ▲  ▲
      │  artuml scan               │  │ mark-ai
      ▼                             │  │
  .artisan/diagram.json ── edits ───┘  │  (amber highlights in the editor)
      │  artuml diff                  │
      ▼                             ack │
  markdown report → artuml scaffold   │
      │  mechanical work done         │
      ▼                               │
  agent: judgement + real bodies      │
      └── new code ────► artuml scan again …
```

## 1. Scan

`artuml scan` parses your C# — the language the scanner supports today — into
`.artisan/diagram.json` (source of truth),
`diagram.puml` (the mirror agents read) and `diagram.html` (the editor). It detects
all six relation kinds and lays the diagram out in layers, roots on top. Re-scans
merge: your positions, notes and relations survive.

Open `diagram.html`, click **Connect file** once, and your edits autosave to disk.
No file-handle API in your browser (Firefox/Safari)? Run `artuml serve` instead
(`localhost:4173`, live autosave) — or just `/artisan-serve` with your agent pack.

## 2. You redesign

In the editor: rename classes, add or remove members, rewire relations, drag things
where they make sense. Write **notes** anywhere, on classes, members, relations or
the whole project. Notes are the strongest thing in the system: agents honor them.

## 3. `artuml diff`

The agent runs `artuml diff` and reads the markdown report:

- **Notes to honor** first
- **Renames** — refactor, never delete-and-recreate
- **Added** — scaffold it, without touching any existing member
- **Removed** — scaffold lists them in one prompt, nothing deleted without your go

Right after, the agent runs `artuml impl-diff` — the diagram compared against the
actual code (read-only, marks nothing seen): diagram items missing from the code,
code drift not in the diagram, and signature mismatches. This read is what
`scaffold` consumes (and refreshes).

## 4. `artuml scaffold`

The agent runs `artuml scaffold`, which applies the diff to the code mechanically:

- **Created** — stub classes for missing diagram classes (`NotImplementedException` bodies, notes as `// NOTE:` comments, placed via the node's `dir` folder), plus new members spliced into existing files
- **Renamed** — class file, declaration and in-file members renamed; call sites outside the file stay agent work
- **Patched** — changed member signatures updated, kind changes applied
- **Moved** — a class whose folder drifted from its `dir` is moved into place
- **Removed** — code drift candidates listed in one prompt (`--yes` skips; nothing is deleted without your go)

Whatever still needs judgement is printed under *For the agent*: refactor call
sites, declined removals, multi-type files. The agent fills the stubs with real
bodies following the notes (`/artisan-implement` does exactly this).

`scaffold` consumes and refreshes `impl-diff.json` (it never touches
`last-ai.json` or `pending.json`) — run it after `impl-diff`, before judging the
leftovers. While mismatches exist, your editor shows a **"Code out of sync"**
badge — hover it for what to do.

## 5. The agent works

Refactors rename call sites, implements the real method bodies per your notes.
When the agent itself wants to change the architecture (new class, new
interface), it edits the diagram and runs `artuml mark-ai`: the changes become
**amber highlights** in your editor.

Changes made from the terminal (`artuml add`/`edit`/`remove`) light the same
highlights — they are recorded in `pending.json` too, so they survive a page
reload and clear with **Mark AI changes seen**. Removals render as tombstones
until you confirm them.

> **Scan caveat:** `artuml scan` re-syncs the diagram from your C# source.
> Classes that exist only in the diagram (not yet implemented) are dropped on
> a re-scan — run `artuml scaffold` (or `/artisan-implement`) before scanning again.

## 6. You confirm

You review the highlights and decide per item: **✓** accepts it, **✕** rejects it
(removals show as struck-through tombstones — dragging one just moves it). The ✓✕
chips map to `artuml ack` / `artuml reject` with ref keys, and the editor's
**Mark AI changes seen** / **Reject AI changes** buttons handle everything at once.
Rejecting reverts the diagram, so your agent never acts on a proposal you turned down.

## 7. Scan again

After the agent writes code, `artuml scan` picks up the new classes and merges
them into the diagram. The loop continues, with the picture always current.

## Guarantees

- The human always wins: diagram edits and notes are binding.
- Agents never delete without asking, and never re-create renamed code.
- Changes are consumed once: `diff` reports only what the agent has not seen yet.
- Everything lives in `.artisan/` next to your project. Nothing is uploaded.

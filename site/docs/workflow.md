# The workflow

One loop, two sides. The human designs, the agent implements, and `artisan` tracks
every change in both directions.

```text
   your code                    the diagram
      │                             ▲  ▲
      │  artisan scan               │  │ mark-ai
      ▼                             │  │
  .artisan/diagram.json ── edits ───┘  │  (amber highlights in the editor)
      │  artisan diff                  │
      ▼                             ack │
  markdown report → agent            │
      │  refactor + scaffold         │
      └── new code ────► artisan scan again …
```

## 1. Scan

`artisan scan` parses your C# into `.artisan/diagram.json` (source of truth),
`diagram.puml` (the mirror agents read) and `diagram.html` (the editor). It detects
all six relation kinds and lays the diagram out in layers, roots on top. Re-scans
merge: your positions, notes and relations survive.

Open `diagram.html`, click **Connect file** once, and your edits autosave to disk.
No file-handle API in your browser (Firefox/Safari)? Run `artisan serve` instead
(`localhost:4173`, live autosave) — or just `/artisan-serve` with your agent pack.

## 2. You redesign

In the editor: rename classes, add or remove members, rewire relations, drag things
where they make sense. Write **notes** anywhere, on classes, members, relations or
the whole project. Notes are the strongest thing in the system: agents honor them.

## 3. `artisan diff`

The agent runs `artisan diff` and reads the markdown report:

- **Notes to honor** first
- **Renames** — refactor, never delete-and-recreate
- **Added** — scaffold it, without touching any existing member
- **Removed** — always asks you before deleting

Right after it runs `artisan impl-diff` — the diagram compared against the actual
code (read-only, marks nothing seen): **diagram items missing from the code**
(the regular diff misses those once acked or scanned out-of-band), **code drift
not in the diagram**, and **signature mismatches**. While they exist, your editor
shows a **"Code out of sync"** badge — hover it for what to do.

## 4. The agent works

Refactors renames across the codebase, scaffolds the new types, implements per your
notes. When the agent itself wants to change the architecture (new class, new
interface), it edits the diagram and runs `artisan mark-ai`: the changes become
**amber highlights** in your editor.

Changes made from the terminal (`artisan add`/`edit`/`remove`) light the same
highlights — they are recorded in `pending.json` too, so they survive a page
reload and clear with **Mark AI changes seen**. Removals render as tombstones
until you confirm them.

> **Scan caveat:** `artisan scan` re-syncs the diagram from your C# source.
> Classes that exist only in the diagram (not yet implemented) are dropped on
> a re-scan — run `/artisan-implement` before scanning again.

## 5. You confirm

You review the highlights and decide per item: **✓** accepts it, **✕** rejects it
(removals show as struck-through tombstones — dragging one just moves it). The ✓✕
chips map to `artisan ack` / `artisan reject` with ref keys, and the editor's
**Mark AI changes seen** / **Reject AI changes** buttons handle everything at once.
Rejecting reverts the diagram, so your agent never acts on a proposal you turned down.

## 6. Scan again

After the agent writes code, `artisan scan` picks up the new classes and merges
them into the diagram. The loop continues, with the picture always current.

## Guarantees

- The human always wins: diagram edits and notes are binding.
- Agents never delete without asking, and never re-create renamed code.
- Changes are consumed once: `diff` reports only what the agent has not seen yet.
- Everything lives in `.artisan/` next to your project. Nothing is uploaded.

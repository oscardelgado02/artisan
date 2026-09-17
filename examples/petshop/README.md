# Petshop — the 2-minute Artisan demo

A tiny C# project that matches the starter diagram in the editor: 5 types,
5 relations, notes that bind the agent. Scan it and you have the whole loop in
front of you.

## Run it

```bash
cd examples/petshop
artisan scan
```

Then open **`.artisan/diagram.html`** in your browser — the self-contained
editor with the diagram already laid out.

## Try the loop

1. **You redesign** — drag a node, rename `Dog.Fetch` to `Retrieve`, write a
   note on `Animal.Speak` ("no default implementation — every animal overrides").
2. **Report it** — `artisan diff` turns your edits into the agent's markdown
   report: notes first, renames stay renames, additions get scaffolded.
3. **Agent proposes** — after the agent changes code, `artisan mark-ai` marks
   its changes; they show up **amber** in the editor until you confirm with
   `artisan ack`.

## What's inside

| File | What it shows |
| --- | --- |
| `Animal.cs` | abstract class — «abstract» stereotype in the diagram |
| `IPet.cs` | interface — dashed realization edges |
| `Dog.cs` / `Cat.cs` | multiple inheritance + realization edges |
| `Owner.cs` | aggregation over a collection of `IPet` |

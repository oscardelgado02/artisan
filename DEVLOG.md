# Devlog

## 18.09.2026
- Real favicon: a brass tile with the serif "A" (`assets/favicon.svg`) replaces the misdrawn glyph — the hub and the docs now ship the same mark as the wordmark.
- `install.sh` fixes the silent-PATH failure: when `artisan` is installed but not resolvable, it appends the global bin to the existing shell rc files (idempotent, marker-checked) and always points to the `npx` fallback.

## 17.09.2026
- Bundled demo: `examples/petshop` — five C# files and a README walk-through, verified end to end with a real `artisan scan`; the hub quickstart now points to it.
- The starter diagram now says what the code does: Owner owns `IPet` (not Dog) and the `Mood` node is gone from the editor's seed — the relation corrected everywhere it appears (site canvas, social cards, default diagram).
- Social preview cards for the hub and the editor (`assets/social-card*.html`): 1280×640, light shell over a dark editor window, relation shapes matching the editor exactly.

## 16.09.2026
- Landing hub built at the apex of artisan-uml.dev: hero with animated terminal (scan / mark-ai / edit scenarios driving the editor's real seed diagram), the agent loop, packages and the personal note — `site/` ships as the GitHub Pages root, docs moved to `/docs/`.

## 14.09.2026
- Repo restructured into the plugin hub: the editor and CLI moved out to their own repos and are imported from npm (`artisan-uml`, `artisan-uml-cli`).
- Agent packs: six `/artisan-*` commands (`scan`, `scaffold`, `implement`, `architect`, `edit`, `status`) for opencode, Claude Code and Codex, with the `pnpm dlx artisan-uml-cli` fallback built into every pack.
- `install.sh`: installs the CLI globally and copies the packs into each tool's command folder.
- Docs site rebuilt (docsify, `docs/`), GitHub Pages deploy workflow added.
- README redone: brass "Artisan" wordmark, package table, agent loop, packs, "Why I built this".
- Community files: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, FUNDING.

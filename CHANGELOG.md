# Changelog

## 0.4.0 — 12.10.2026

### Changed
- All agent packs invoke the CLI as `artuml` (the binary's new name; `artisan` collided with Laravel's). Requires `artisan-uml-cli` ^0.4.0.
- `install.sh` checks `command -v artuml` and grows the `# artuml` PATH marker if needed. Slash-pack names `/artisan-*` unchanged.
## 0.3.0 — 11.10.2026

### Added
- `impl-diff` support in the agent packs: `/artisan-implement` and `/artisan-scaffold` (all three agent dirs) now run `artisan impl-diff` right after `diff` — diagram items missing from the code get implemented/scaffolded too (the regular diff misses them once acked or scanned out-of-band), code drift is surfaced to the human instead of silently adopted, and signature mismatches get aligned.
- Workflow docs updated: `site/docs/workflow.md` explains the new step and points to the editor's **"Code out of sync"** badge.

### Notes
- Consumes `artisan-uml` 1.2.0 (impl-sync badge) and `artisan-uml-cli` 0.3.0 (`impl-diff` command, `GET /api/impl`). Requires those versions to be installed for the full loop.

## 0.2.0 — 20.09.2026

### Added
- New agent pack: `/artisan-serve` — starts the localhost editor (`localhost:4173`, live autosave to `diagram.json`) for browsers without the file-handle API (Firefox/Safari). Backgrounded run, `/api/status` verification, stop and busy-port instructions baked in.
- Docs: serve path in the workflow guide, per-item ✓/✕ review workflow (accept/reject with ref keys), scan caveat (implement diagram-only classes before rescanning).
- `agents/README.md` and main README updated to the seven-command pack table.

### Notes
- Packs unchanged otherwise; the review loop gains `artisan ack`/`artisan reject` with ref keys from `artisan-uml-cli` 0.2.0.

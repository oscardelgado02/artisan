# Changelog

## 0.2.0 — 20.09.2026

### Added
- New agent pack: `/artisan-serve` — starts the localhost editor (`localhost:4173`, live autosave to `diagram.json`) for browsers without the file-handle API (Firefox/Safari). Backgrounded run, `/api/status` verification, stop and busy-port instructions baked in.
- Docs: serve path in the workflow guide, per-item ✓/✕ review workflow (accept/reject with ref keys), scan caveat (implement diagram-only classes before rescanning).
- `agents/README.md` and main README updated to the seven-command pack table.

### Notes
- Packs unchanged otherwise; the review loop gains `artisan ack`/`artisan reject` with ref keys from `artisan-uml-cli` 0.2.0.

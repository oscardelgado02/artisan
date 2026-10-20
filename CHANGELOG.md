# Changelog

## 0.5.1 — 20.10.2026

### Fixed
- `install.sh` installs the CLI version pinned in `package.json` (`artisan-uml-cli@^0.5.1`). A bare `pnpm add -g artisan-uml-cli` can resolve an OLDER release (pnpm's 24 h `minimumReleaseAge` ignores `latest`), which paired the packs with a CLI that lacked `diff --peek` and the `status` peek.
- `install.sh` no longer dies when the global package dir is not writable (no sudo): it retries with a user-local `PNPM_HOME` (`~/.local/share/pnpm`), and if the CLI install fails anyway the packs are still copied and the failure is reported (exit 1) instead of the whole script aborting.
- `install.sh` no longer swallows the `pnpm bin -g` error — the PATH fix used to be skipped silently. It now prints the exact `export PATH=…` line, because agent shells (opencode, Claude Code, Codex) do not read `~/.profile` or `~/.bashrc`.
- The opencode packs are copied to `~/.config/opencode/commands/` — opencode reads the plural directory, the installer wrote to `command/` and the packs never loaded.
- `install.sh` verifies the result (`artuml --version`).

### Changed
- The install snippet said `cd artuml`; the clone directory is `artisan` (README, site docs, site page).

### Release order
- `artisan-uml-cli@0.5.1` has to be on npm first. After it is published: run `pnpm install` in this repo and commit the refreshed `pnpm-lock.yaml` (it still pins 0.1.0).

## 0.5.0 — 18.10.2026

### Changed
- **BREAKING: `/artisan-edit` removed** from all three packs — `/artisan-architect` covers it (and now prefers the `artuml add/edit/remove` CLI over direct `diagram.json` edits; direct edits are a documented last resort, followed by one `mark-ai`).
- New `artisan-cli` **skill** (not a slash command) — an `artuml` reference: commands, flags, config paths and precedence, `.artisan` file roles; opencode loads it automatically when running or debugging commands. Repo source `skills/artisan-cli/SKILL.md`, installed to `~/.config/opencode/skills/artisan-cli/`.
- `/artisan-scan` runs `mark-ai` after scanning and points the human at `/artisan-serve` for editing (a standalone `diagram.html` is read-only).
- `/artisan-scaffold` + `/artisan-implement` run `mark-ai` right after `diff`, and handle removals in ONE explicit prompt ("The following classes will be removed. Do you want to continue?") — skippable via the new `askBeforeRemove` config.
- `/artisan-status` shows the actual human change report (CLI's non-consuming peek) plus counters, then runs `mark-ai`.
- All packs are language-agnostic in wording — today the scanner supports C# only (see the README's *Supported languages*).
- Requires `artisan-uml-cli` ^0.5.0 (config files, `diff --peek`, merged pending refs).

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

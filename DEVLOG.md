# Devlog

## 14.09.2026
- Repo restructured into the plugin hub: the editor and CLI moved out to their own repos and are imported from npm (`artisan-uml`, `artisan-uml-cli`).
- Agent packs: six `/artisan-*` commands (`scan`, `scaffold`, `implement`, `architect`, `edit`, `status`) for opencode, Claude Code and Codex, with the `pnpm dlx artisan-uml-cli` fallback built into every pack.
- `install.sh`: installs the CLI globally and copies the packs into each tool's command folder.
- Docs site rebuilt (docsify, `docs/`), GitHub Pages deploy workflow added.
- README redone: brass "Artisan" wordmark, package table, agent loop, packs, "Why I built this".
- Community files: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, FUNDING.

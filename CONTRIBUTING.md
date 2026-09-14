# Contributing to Artisan

Thanks for wanting to make Artisan better. This repo is the plugin hub: agent packs
(`agents/`), the installer (`install.sh`) and docs (`docs/`). The editor and the CLI
live in their own repositories ([artisan-uml](https://github.com/oscardelgado02/artisan-uml),
[artisan-uml-cli](https://github.com/oscardelgado02/artisan-uml-cli)) — please file
code changes there.

## Setup

Requires [Node.js](https://nodejs.org) 18+ and [pnpm](https://pnpm.io).

```bash
pnpm install    # pulls the CLI + editor from the registry
pnpm run artisan --help    # the CLI, from your local install
```

## Ground rules

- **One PR per feature.** Small, focused pull requests get reviewed faster.
- **Test your change**: run `./install.sh` in a scratch environment and try the
  affected pack in a real agent session.
- **No new dependencies.** The packages are zero-dependency by design; this repo
  only pulls the CLI from npm.
- **Packs stay in sync.** The three tools must behave the same: if you change one
  command's pack, update `agents/opencode/`, `agents/claude/` and `agents/codex/`.
- **Human wins.** Packs must preserve the guarantees: renames are refactors (never
  delete-and-recreate), existing members are never modified without asking,
  removals always require explicit human approval, notes are binding.
- Plain files only: no build step, no plugins, nothing agents must compile.

## Pull requests

1. Fork, create a branch from `main`.
2. Keep the wording style of the existing packs (short, imperative, tool-agnostic).
3. If user-facing, update the docs (`docs/`).
4. Open the PR describing what a user will notice after merging.

## Reporting issues

Bug reports and ideas are welcome in
[Issues](https://github.com/oscardelgado02/artisan/issues). For security reports,
see [SECURITY.md](SECURITY.md).

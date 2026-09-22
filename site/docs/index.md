# Artisan

Architecture control for agentic coding workflows. Artisan turns your codebase into
a living **class diagram** that you design, and that your coding agent implements:
you make the architectural decisions in a fluid visual editor, the agent does the
typing at full speed, and `artisan` keeps both sides honest about who changed what.

This repository is the **plugin hub**: slash-command packs for opencode, Claude Code
and Codex, plus the installer. The editor and the CLI ship as npm packages and are
imported from there.

- [`artisan-uml`](https://www.npmjs.com/package/artisan-uml) — the editor (source of truth: `.artisan/diagram.json`)
- [`artisan-uml-cli`](https://www.npmjs.com/package/artisan-uml-cli) — the CLI (`scan`, `diff`, `impl-diff`, `mark-ai`, `ack`, `status`, `add`/`edit`/`remove`, `editor`, `serve`)

## Install

Requires [Node.js](https://nodejs.org) 18+ and [pnpm](https://pnpm.io) (npm works too).

```bash
git clone https://github.com/oscardelgado02/artisan
cd artisan
./install.sh
```

What it does:

1. installs the CLI globally: `pnpm add -g artisan-uml-cli`
2. copies the five `/artisan-*` commands into your agents' command folders
   (opencode: `~/.config/opencode/command/`, Claude Code: `~/.claude/commands/`,
   Codex: `~/.codex/prompts/`)

Then, in any project:

```bash
cd your-unity-project
artisan scan
```

Open `.artisan/diagram.html` — the full editor as a single self-contained file.
Click **Connect file** once so your edits autosave to `.artisan/diagram.json`
(Chrome/Edge), or run `artisan serve` for a localhost editor with autosave that
works in any browser.

## The workflow

1. `artisan scan` — C# → diagram + PlantUML mirror agents can read
2. You redesign: drag, rewire, rename, add classes, write notes
3. `artisan diff` — a markdown report of your changes for the agent
4. The agent refactors code (renames stay renames; existing members untouched)
5. `artisan mark-ai` — the agent's own architecture proposals appear amber in your editor
6. You confirm: ✓ per item (`artisan ack`), ✕ reverts it (`artisan reject`) — both sides sync

Full loop in [the workflow](workflow.md); every command in the
[CLI docs](https://cli.artisan-uml.dev/).

## Agent packs

Seven commands, same behavior in all three tools:

| Command | What it does |
| --- | --- |
| `/artisan-scan` | scan code → class diagram + PlantUML, open the editor |
| `/artisan-scaffold` | diagram edits → code stubs (renames detected, existing code untouched) |
| `/artisan-implement` | diagram edits → real code with bodies, per notes |
| `/artisan-architect` | agent proposes an architecture change; you review amber highlights |
| `/artisan-edit` | applies your dictated architecture changes to the diagram (add/edit/remove) |
| `/artisan-status` | who changed what, what is pending |

Details and manual install: [agent packs](agent-packs.md).

## Why I built this

I'm [Óscar Delgado](https://oscardelgado.dev), a software engineer. I like to plan the
architecture first and keep it visible as the codebase grows, that's why I built the
[`artisan-uml`](https://github.com/oscardelgado02/artisan-uml) editor.

Agentic coding workflows changed how fast we build, but they brought a new problem:
agents happily create architecture on their own, new classes, new abstractions,
rewired dependencies, without any real control from the engineer, unless you write a
really specific prompt every time. The result is often code that works today and
drifts tomorrow, with no shared picture of the system.

Artisan is my answer for that side of the workflow. It turns your codebase into a
diagram you can *see*, gives you a fluid, visual space to make the architectural
decisions yourself, and then lets the agent do what it is great at, implementing them
fast. You keep the control and the overview; the agents keep the speed. Everyone
works from the same picture.

I released it as open source so that as many people as possible can use it. If it
helps you stay in the driver's seat of your next project, it was worth building.

## License

[MIT](LICENSE) © Artisan UML contributors

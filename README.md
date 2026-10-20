<div align="center">
  <img src="assets/wordmark.svg" alt="Artisan UML" width="280" />

  <h2>The agentic plugin</h2>
  <p>Architecture control for agentic workflows</p>
</div>

Your coding agent writes great code, but architecture needs a human. Artisan gives
you a living **class diagram** of your project: you design in a fluid visual editor,
the agent implements at full speed, and `artuml` keeps track of who changed what.

- The agent reads the architecture from `.artisan/diagram.puml` before touching code
- You make the decisions in `.artisan/diagram.html` (the full editor, one file)
- `artuml diff` turns your edits into a markdown report the agent executes:
  renames stay renames, notes are honored, existing members are never touched
- The agent's own proposals appear **amber** in your editor until you confirm

The packages are imported from npm, this repo is the plugin hub: the slash-command
packs and the installer.

[![CLI](https://img.shields.io/npm/v/artisan-uml-cli)](https://www.npmjs.com/package/artisan-uml-cli)
[![Editor](https://img.shields.io/npm/v/artisan-uml)](https://www.npmjs.com/package/artisan-uml)
![Node](https://img.shields.io/badge/node-%E2%89%A518-green)
![Deps](https://img.shields.io/badge/dependencies-zero-brightgreen)

## Quick start

Requires [Node.js](https://nodejs.org) 18+ and [pnpm](https://pnpm.io) (npm works too).

```bash
git clone https://github.com/oscardelgado02/artisan
cd artisan
./install.sh
```

The installer installs the CLI (`pnpm add -g artisan-uml-cli`) and copies the `/artisan-*`
packs — six workflow commands and a CLI reference — into your agents' command
folders (opencode, Claude Code, Codex).

Then, in any project:

```bash
cd your-project
artuml scan
```

Open `.artisan/diagram.html` and click **Connect file** once — your edits autosave
to `.artisan/diagram.json`.

No project at hand? Run it on the bundled demo: `cd examples/petshop` and scan —
5 types, 5 relations, ready in seconds. See [`examples/petshop`](examples/petshop/).

## The packages

| Package | Role | Source of truth |
| --- | --- | --- |
| [`artisan-uml`](https://www.npmjs.com/package/artisan-uml) | the class diagram editor (also a web app) | `diagram.json` |
| [`artisan-uml-cli`](https://www.npmjs.com/package/artisan-uml-cli) | `scan`, `diff`, `impl-diff`, `mark-ai`, `ack`, `status`, `add`/`edit`/`remove`, `editor`, `serve` | `.artisan/` |

> **Language support:** C# only, for now. The CLI's shared extractor
> (`lib/extract.mjs` in `artisan-uml-cli`) is the single seam a new parser
> plugs into — see the CLI README's *Supported languages*.

## The agent loop

1. **`artuml scan`** — C# → diagram: all six UML relations, layered layout, notes preserved
2. **You redesign** — drag, rename, rewire, write notes
3. **`/artisan-scaffold`** — stubs for what you added, renames refactored
4. **`/artisan-implement`** — real bodies, honoring your notes
5. **`/artisan-architect`** — the agent proposes; you review amber highlights
6. **`artuml scan`** again — the picture stays current

Full loop: [the workflow docs](https://artisan-uml.dev/docs/#/workflow).
Every command: [CLI docs](https://cli.artisan-uml.dev/).

## The packs

Six workflow commands, same behavior in [opencode](https://opencode.ai), Claude
Code and Codex. Additionally a `artisan-cli` skill for opencode provides the
`artuml` reference — flags, config paths, file meanings — that the agent loads
when it needs them:

| Command | What it does |
| --- | --- |
| `/artisan-scan` | scan code → diagram + PlantUML, open the editor (language support: C# only today) |
| `/artisan-serve` | live editor server on localhost — recommended for editing the architecture |
| `/artisan-scaffold` | diagram edits → code stubs |
| `/artisan-implement` | diagram edits → real code, per notes |
| `/artisan-architect` | agent proposes an architecture change; you review |
| `/artisan-status` | pending changes in both directions |
| `artisan-cli` (skill) | `artuml` CLI reference — commands, flags, config locations |

Any agent works without packs too — Cursor, Windsurf, Gemini CLI, anything that
runs commands. Install the CLI, then point the agent at `artuml diff` and the
rules in [agents/README.md](agents/README.md). Full guide:
[Any other agent](https://artisan-uml.dev/docs/#/agent-packs).

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

## Documentation

Hosted on GitHub Pages: **[Documentation](https://artisan-uml.dev/docs/)** —
getting started, the workflow and agent-pack reference. The same pages live in
[`docs/`](docs/) as plain markdown for offline reading. Editor and CLI have their
own docs ([editor](https://editor.artisan-uml.dev/docs/),
[CLI](https://cli.artisan-uml.dev/)).

## Community

- [Contributing](CONTRIBUTING.md) — repo setup, packs and PR expectations
- [Code of Conduct](CODE_OF_CONDUCT.md) — Contributor Covenant
- [Security](SECURITY.md) — how to report vulnerabilities privately
- [Changelog](DEVLOG.md) — what changed, day by day

## License

[MIT](LICENSE) © Artisan UML contributors

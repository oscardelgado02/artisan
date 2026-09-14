# Security Policy

## Supported versions

Only the latest release of Artisan (this repo) receives security fixes. The editor
and the CLI have their own policies:
[`artisan-uml`](https://github.com/oscardelgado02/artisan-uml/blob/main/SECURITY.md),
[`artisan-uml-cli`](https://github.com/oscardelgado02/artisan-uml-cli/blob/main/SECURITY.md).

## Reporting a vulnerability

Please use
[GitHub private vulnerability reporting](https://github.com/oscardelgado02/artisan/security/advisories/new)
instead of a public issue. Include steps to reproduce; we respond as fast as we can.

## Scope

- **`install.sh`**: must only write to the documented destinations
  (`pnpm add -g artisan-uml-cli`, the agents' command folders), must not execute
  downloaded content, and must not copy files outside the listed paths.
- **Agent packs (`agents/*.md`)**: prompt content only, never instructions that
  execute or exfiltrate data.
- **This repo ships no code that processes untrusted input** — the parser, server
  and generated HTML live in the CLI and editor repos.

## Out of scope

- The editor app and the CLI themselves (see their own security policies).
- Prompt-injection behaviors of third-party agentic tools running the packs.

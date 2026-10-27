#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, platform } from "node:os";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PKG = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const HOME = homedir();
const CLI_SPEC = PKG.dependencies["artisan-uml-cli"];

const GET_STARTED = [
  "Get started in any project:",
  "",
  "  artuml scan",
  "",
  "Open .artisan/diagram.html (the editor) — click Connect file once.",
  "Run with --help to see all options.",
];

function expand(p) {
  return p.replace(/^~(?=\/|$)/, HOME);
}

function copy(src, dst, counts) {
  if (existsSync(dst) && readFileSync(dst).equals(readFileSync(src))) {
    counts.unchanged++;
    return;
  }
  const existed = existsSync(dst);
  mkdirSync(dirname(dst), { recursive: true });
  writeFileSync(dst, readFileSync(src));
  counts[existed ? "updated" : "added"]++;
}

function packFiles(toolDir) {
  return readdirSync(join(ROOT, toolDir)).filter((f) => f.startsWith("artisan-") && f.endsWith(".md")).sort();
}

const TOOLS = {
  opencode: {
    label: "opencode",
    detect: "~/.config/opencode",
    bundles: [
      { srcs: () => packFiles("agents/opencode").map((f) => join(ROOT, "agents/opencode", f)), dst: "~/.config/opencode/commands", pdst: ".opencode/commands" },
      { srcs: () => ["SKILL.md"], srcBase: join(ROOT, "skills/artisan-cli"), dst: "~/.config/opencode/skills/artisan-cli", pdst: ".opencode/skills/artisan-cli" },
    ],
  },
  claude: {
    label: "Claude Code",
    detect: "~/.claude",
    bundles: [
      { srcs: () => packFiles("agents/claude").map((f) => join(ROOT, "agents/claude", f)), dst: "~/.claude/commands", pdst: ".claude/commands" },
    ],
  },
  codex: {
    label: "Codex",
    detect: "~/.codex",
    bundles: [
      { srcs: () => packFiles("agents/codex").map((f) => join(ROOT, "agents/codex", f)), dst: "~/.codex/prompts", pdst: ".codex/prompts" },
    ],
  },
};

function argValue(args, flag) {
  const i = args.indexOf(flag);
  if (i === -1) return null;
  const v = args[i + 1];
  if (!v || v.startsWith("--")) {
    err(`missing value for ${flag}`);
    process.exit(2);
  }
  return v;
}

function err(msg) {
  console.error(`  artisan-agent: ${msg}`);
}

function selectedTools(args) {
  let names = ["opencode", "claude", "codex"];
  const raw = argValue(args, "--tool");
  if (raw) {
    names = raw.split(",").map((t) => t.trim());
    for (const n of names) {
      if (!TOOLS[n]) {
        err(`unknown tool "${n}" — known tools: ${Object.keys(TOOLS).join(", ")}`);
        process.exit(2);
      }
    }
  }
  return names;
}

function canRun(cmd) {
  return spawnSync(cmd, ["--version"], { stdio: "pipe" }).status === 0;
}

function cliMode(args) {
  const env = process.env.ARTISAN_CLI;
  if (args.includes("--cli")) {
    const v = argValue(args, "--cli");
    if (!["global", "local", "no"].includes(v)) {
      err(`--cli must be global, local or no (got "${v}")`);
      process.exit(2);
    }
    return v;
  }
  if (["global", "local", "no"].includes(env)) return env;
  return "auto";
}

function cliHome() {
  return join(HOME, ".local/share/pnpm");
}

function cliLocalBin() {
  return join(cliHome(), "bin");
}

function tryCli(cmd, args, env) {
  if (!canRun(cmd)) return null;
  const r = spawnSync(cmd, args, { stdio: "inherit", env: env ? { ...process.env, ...env } : undefined });
  if (r.status === 0) {
    const v = spawnSync("artuml", ["--version"], { encoding: "utf8" }).stdout?.trim() || "installed";
    return `artuml ${v}`;
  }
  return null;
}

function cliInstallGlobal(spec) {
  return tryCli("pnpm", ["add", "-g", spec]) || tryCli("npm", ["install", "-g", spec]);
}

function cliInstallLocal(spec) {
  const env = { PNPM_HOME: cliHome(), PATH: `${cliLocalBin()}:${process.env.PATH}` };
  return tryCli("pnpm", ["add", "-g", spec], env)
    || tryCli("npm", ["install", "-g", "--prefix", join(HOME, ".local"), spec]);
}

async function askLocalCli() {
  if (!process.stdin.isTTY) {
    console.error("  global CLI install failed and this is not an interactive terminal.");
    console.error("  Rerun as a human, or choose explicitly: npx artisan-agent install --cli local|no");
    return false;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((res) => rl.question(`Install the CLI in ${cliLocalBin()} instead? [Y/n] `, res));
  rl.close();
  if (/^n/i.test(answer.trim())) {
    console.log("  Skipped the local CLI install.");
    return false;
  }
  return true;
}

function cliFail(spec) {
  const npx = platform() === "win32" ? "npx" : "npx --yes";
  console.error("  The CLI could NOT be installed — the packs above are still in place.");
  console.error(`  Run it without installing: ${npx} ${spec} <command>`);
  console.error(`  Or install manually:       pnpm add -g "${spec}"`);
  console.error(`  Or user-locally:           npx artisan-agent install --cli local`);
  return 0;
}

async function cliInstall(args, mode) {
  if (canRun("artuml")) {
    const v = spawnSync("artuml", ["--version"], { encoding: "utf8" }).stdout?.trim();
    console.log(`CLI already on PATH: artuml ${v || ""}`);
    return 1;
  }
  const spec = `artisan-uml-cli@${CLI_SPEC}`;
  console.log(`→ Installing ${spec}`);
  if (mode === "no") return 1;
  if (mode === "global") {
    const ok = cliInstallGlobal(spec);
    if (ok) {
      console.log(`CLI done: ${ok} (open a new shell so it is on PATH everywhere)`);
      return 1;
    }
    return cliFail(spec);
  }
  if (mode === "local") {
    const ok = cliInstallLocal(spec);
    if (ok) {
      console.log(`CLI done: ${ok} (installed in ${cliLocalBin()})`);
      localNote();
      return 1;
    }
    return cliFail(spec);
  }
  const ok = cliInstallGlobal(spec);
  if (ok) {
    console.log(`CLI done: ${ok} (open a new shell so it is on PATH everywhere)`);
    return 1;
  }
  if (await askLocalCli()) {
    const ok2 = cliInstallLocal(spec);
    if (ok2) {
      console.log(`CLI done: ${ok2} (installed in ${cliLocalBin()})`);
      localNote();
      return 1;
    }
  }
  return cliFail(spec);
}

function localNote() {
  console.log(`Note: agent shells do not read your rc files. Give them the CLI with:`);
  console.log(`  export PNPM_HOME="${cliHome()}"; export PATH="$PNPM_HOME/bin:$PATH"`);
  console.log(`Or let the packs run it on the fly: npx --yes artisan-uml-cli@${CLI_SPEC} <command>`);
}

async function doInstall(args) {
  const all = args.includes("--all");
  const project = args.includes("--project");
  const tools = selectedTools(args);
  const counts = { added: 0, updated: 0, unchanged: 0 };
  const missing = [];

  if (project) console.log("→ Installing packs into the current project (project-local dirs)");

  for (const name of tools) {
    const tool = TOOLS[name];
    const detected = existsSync(expand(tool.detect));
    if (!detected && !all && !project) {
      missing.push(name);
      continue;
    }
    console.log(`→ ${tool.label}${project ? "" : detected ? "" : " (not detected, installing anyway — use --tool to restrict)"}`);
    for (const bundle of tool.bundles) {
      const dstRoot = project ? bundle.pdst : bundle.dst;
      if (!project && !dstRoot) continue;
      for (const src of bundle.srcs()) {
        const srcPath = bundle.srcBase ? join(bundle.srcBase, src) : src;
        const base = bundle.srcBase ? src : src.split("/").pop();
        copy(srcPath, join(expand(dstRoot), base), counts);
      }
    }
    const dstRoot = project ? tool.bundles[0].pdst : tool.bundles[0].dst;
    console.log(`  packs → ${join(expand(dstRoot), "artisan-*.md")}${getSkillPaths(tool, project)}`);
  }

  for (const name of missing) {
    console.log(`→ ${TOOLS[name].label}: not detected (no ${TOOLS[name].detect}) — skipped. Rerun with --all or --tool ${name} to install anyway.`);
  }

  console.log(`Packs: ${counts.added} added, ${counts.updated} updated, ${counts.unchanged} unchanged`);
  const cliStatus = await cliInstall(args, cliMode(args));
  console.log("");
  for (const line of GET_STARTED) console.log(line);
  if (missing.length && !all && !project) {
    console.log("");
    console.log("Missing a tool? Rerun with --all (or --tool <name>) — the list above explains.");
  }
  process.exit(cliStatus);
}

function getSkillPaths(tool, project) {
  if (tool.bundles.length < 2) return "";
  const skill = tool.bundles[1];
  const dst = project ? skill.pdst : skill.dst;
  return dst ? ` (skill → ${join(expand(dst), "SKILL.md")})` : "";
}

function doList() {
  console.log(`artisan-agent ${PKG.version} — ${PKG.description}`);
  console.log(`CLI: ${canRun("artuml") ? `artuml on PATH (${spawnSync("artuml", ["--version"], { encoding: "utf8" }).stdout.trim()})` : "artuml NOT on PATH (packs fall back to npx artisan-uml-cli)"}`);
  console.log("");
  for (const [name, tool] of Object.entries(TOOLS)) {
    const detected = existsSync(expand(tool.detect));
    console.log(`${tool.label}${detected ? "" : " (install dir not detected)"}`);
    for (const bundle of tool.bundles) {
      const dst = expand(bundle.dst);
      if (!existsSync(dst)) {
        console.log(`  - ${dst}: nothing installed`);
        continue;
      }
      const present = readdirSync(dst).filter((f) => f === "SKILL.md" || /^artisan-.*\.md$/.test(f)).sort();
      if (present.length) {
        for (const f of present) console.log(`  - ${join(dst, f)}`);
      } else {
        console.log(`  - ${dst}: nothing installed`);
      }
    }
  }
}

function doUninstall(args) {
  const project = args.includes("--project");
  const tools = selectedTools(args);
  let removed = 0;
  for (const name of tools) {
    const tool = TOOLS[name];
    for (const bundle of tool.bundles) {
      for (const root of project ? [bundle.pdst] : [bundle.dst]) {
        if (!root) continue;
        const dstRoot = expand(root);
        if (!existsSync(dstRoot)) continue;
        for (const src of bundle.srcs()) {
          const base = bundle.srcBase ? src : src.split("/").pop();
          const dst = join(dstRoot, base);
          if (existsSync(dst)) {
            rmSync(dst, { recursive: true, force: true });
            removed++;
          }
        }
        if (bundle.srcBase) {
          try {
            if (readdirSync(dstRoot).length === 0) rmSync(dstRoot, { recursive: true });
          } catch {}
        }
      }
    }
  }
  console.log(`Removed ${removed} artisan pack file(s)${project ? " (project)" : ""}.`);
}

function usage() {
  console.log(`artisan-agent ${PKG.version} — install the /artisan-* packs for your agentic tools

Usage:
  npx artisan-agent                 install CLI + packs for detected tools
  npx artisan-agent install [flags]
  npx artisan-agent list            show what is installed per tool
  npx artisan-agent uninstall       remove the copied packs again

Flags:
  --all                  install even where an agentic tool is not detected
  --project              install into the current project instead of globally
  --tool <list>          comma-separated subset: opencode,claude,codex
  --cli global|local|no  how to install the artisan-uml-cli (default: global, ask to fall back local; env ARTISAN_CLI)
  --help                 this text

Tools per project:
  opencode      ~/.config/opencode/commands/   (+ skill: ~/.config/opencode/skills/artisan-cli/)
  Claude Code   ~/.claude/commands/
  Codex         ~/.codex/prompts/
  Any other agent: no install needed — point it at "artuml diff" and see
  https://github.com/oscardelgado02/artisan#agent-packs`);
}

const args = process.argv.slice(2);
const cmd = args[0] && !args[0].startsWith("--") ? args[0] : "install";
if (args.includes("--help") || args.includes("-h")) {
  usage();
} else if (cmd === "install") {
  doInstall(args);
} else if (cmd === "list") {
  doList();
} else if (cmd === "uninstall") {
  doUninstall(args);
} else {
  err(`unknown command "${cmd}"`);
  usage();
  process.exit(2);
}

# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-platform agent skill distribution system. Skills and sub-agents are authored once in `skills/` and installed to **Claude Code**, **Gemini CLI**, and **Codex** via a TypeScript CLI that handles format conversion and tool name substitution.

## Build & Test Commands

Most build/test commands run from `installer/`. Run the built installer from project root.

```bash
cd installer
npm install          # install dependencies
npm run build        # production build (tsup → dist/)
npm run dev          # watch mode
npm test             # run tests (vitest)
npx vitest run src/__tests__/pipeline.test.ts  # single test file
cd ..
node installer/dist/index.js        # run installer (interactive TUI)
node installer/dist/index.js --all  # install all skills/agents to all platforms
```

## Architecture

### Pipeline

```
skills/<name>/SKILL.md + skill.yaml
  → scanner.ts discovers skills & agents
  → transform.ts replaces {{tool.*}} placeholders per platform
  → transform.ts converts to target format (Markdown for skills, TOML for Codex agents)
  → installer.ts writes to platform-specific paths + copies references/
```

### Installer Source (`installer/src/`)

- `config.ts` — loads `platforms.yaml` (tool mappings, output paths) and parses `skill.yaml` manifests + agent frontmatter
- `scanner.ts` — walks `skills/` to find installable skills (by `skill.yaml` presence) and agents (from manifest `agents:` field)
- `transform.ts` — `{{tool.*}}` placeholder substitution + output formatters (Markdown with YAML frontmatter, TOML agent, Codex config.toml registration)
- `installer.ts` — orchestrates transform → write → copy references
- `prompts.ts` — 4-step interactive TUI (platform → skills → agents → confirm)
- `index.ts` — CLI entry point

### Platform Output Formats

| Platform | Skills | Agents |
|----------|--------|--------|
| Claude Code | `.claude/skills/<name>/SKILL.md` (raw markdown) | `.claude/agents/<name>.md` (YAML frontmatter: `model`, `tools`, `maxTurns`) |
| Gemini CLI | `.gemini/skills/<name>/SKILL.md` (raw markdown) | `.gemini/agents/<name>.md` (YAML frontmatter: `kind: local`, `model`, `tools`, `max_turns`) |
| Codex | `.codex/skills/<name>/SKILL.md` (raw markdown) | `.codex/agents/<name>.toml` (TOML: `model`, `developer_instructions`) + registration in `.codex/config.toml` |

### Skill Structure

Each skill in `skills/<name>/` has:
- `SKILL.md` — platform-neutral content (the source of truth)
- `skill.yaml` — manifest declaring name, platforms, includes, and agent references
- `references/` — optional supporting docs (checklists, templates, playbooks), copied alongside on install
- `agents/` — optional sub-agent markdown files with per-platform frontmatter

### Skill Interdependencies

`research` → uses `{{tool.task_tracking}}` (platform-adaptive) for task tracking → spawns `code-explorer` agent for codebase exploration.
- Example placeholder patterns are platform-aware and must stay in `tool` namespace (for example `{{tool.ask_user}}` for user prompts).

### Reference Projects

`.ref/repos/` contains 9 git submodules (rpikit, hyperpowers, oh-my-claudecode, etc.) used as reference material for skill design patterns. These are read-only references, not dependencies.

## Key Conventions

- Agent frontmatter uses a `platforms:` block with per-platform config (model, tools, turns). The installer reads this to generate platform-specific output.
- `SKILL.md` and agent bodies use `{{tool.<key>}}` placeholders for all platform-dependent tool calls and workflow actions.
- Placeholder engine rule: only `tool.*` keys are substituted. The substitution is implemented in `transform.ts` as `{{tool.<key>}}` replacement; other Mustache-like patterns are **Non-Goal and must not be introduced**.
- When you need a platform-specific action phrase, put the full phrase in the mapping value (including spaces/prefix), not in fixed SKILL text. Example: `... questions one at a time{{tool.ask_user}}:`.
- If a platform has no equivalent tool, use empty-string mapping in `installer/platforms.yaml` (for example, Codex) so the phrase remains natural without placeholder residue.
- Mappings are defined in `installer/platforms.yaml`; every new `{{tool.<key>}}` used in source content must be added to each relevant platform or explicitly documented as intentionally missing.
- Codex agents require two files: the agent TOML + a `[agents.<name>]` entry in `.codex/config.toml`. The installer handles both.
- `installer/src/` is the source of truth. `installer/dist/` is a local build artifact and may be stale until `npm run build` is run.
- The primary language for documentation and commit messages in this project is mixed Korean/English.

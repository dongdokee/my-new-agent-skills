# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-platform agent skill distribution system. Skills and sub-agents are authored once in `skills/` and installed to **Claude Code**, **Gemini CLI**, and **Codex** via a TypeScript CLI that handles format conversion and tool name substitution.

## Build & Test Commands

All commands run from `installer/`:

```bash
npm install          # install dependencies
npm run build        # production build (tsup → dist/)
npm run dev          # watch mode
npm test             # run tests (vitest)
npx vitest run src/__tests__/pipeline.test.ts  # single test file
node dist/index.js   # run installer (from project root)
```

## Architecture

### Pipeline

```
skills/<name>/SKILL.md + skill.yaml
  → scanner.ts discovers skills & agents
  → transform.ts replaces {{tool.*}} placeholders per platform
  → transform.ts converts to target format (Markdown or TOML)
  → installer.ts writes to platform-specific paths + copies references/
```

### Installer Source (`installer/src/`)

- `config.ts` — loads `platforms.yaml` (tool mappings, output paths) and parses `skill.yaml` manifests + agent frontmatter
- `scanner.ts` — walks `skills/` to find installable skills (by `skill.yaml` presence) and agents (from manifest `agents:` field)
- `transform.ts` — `{{tool.*}}` placeholder substitution + output formatters (Markdown with YAML frontmatter, TOML command, TOML agent, Codex config.toml registration)
- `installer.ts` — orchestrates transform → write → copy references
- `prompts.ts` — 4-step interactive TUI (platform → skills → agents → confirm)
- `index.ts` — CLI entry point

### Platform Output Formats

| Platform | Skills | Agents |
|----------|--------|--------|
| Claude Code | `.claude/commands/<name>.md` (raw markdown) | `.claude/agents/<name>.md` (YAML frontmatter: `model`, `tools`, `maxTurns`) |
| Gemini CLI | `.gemini/commands/<name>.toml` (TOML with `prompt` field) | `.gemini/agents/<name>.md` (YAML frontmatter: `kind: local`, `model`, `tools`, `max_turns`) |
| Codex | `.codex/<name>.toml` | `.codex/agents/<name>.toml` (TOML: `model`, `developer_instructions`) + registration in `.codex/config.toml` |

### Skill Structure

Each skill in `skills/<name>/` has:
- `SKILL.md` — platform-neutral content (the source of truth)
- `skill.yaml` — manifest declaring name, platforms, includes, and agent references
- `references/` — optional supporting docs (checklists, templates, playbooks), copied alongside on install
- `agents/` — optional sub-agent markdown files with per-platform frontmatter

### Skill Interdependencies

`research` → uses `mapping-task-tools` for task tracking → spawns `code-explorer` agent for codebase exploration. `mapping-task-tools` → references `reciting-task-state` for Gemini CLI (file-based task tracking).

### Reference Projects

`.ref/repos/` contains 9 git submodules (rpikit, hyperpowers, oh-my-claudecode, etc.) used as reference material for skill design patterns. These are read-only references, not dependencies.

## Key Conventions

- Agent frontmatter uses a `platforms:` block with per-platform config (model, tools, turns). The installer reads this to generate platform-specific output.
- `{{tool.*}}` placeholders in agent bodies are Mustache-style. Only `tool.*` keys are substituted; other patterns like `{{args}}` pass through untouched. Mappings are defined in `installer/platforms.yaml`.
- Codex agents require two files: the agent TOML + a `[agents.<name>]` entry in `.codex/config.toml`. The installer handles both.
- The primary language for documentation and commit messages in this project is mixed Korean/English.

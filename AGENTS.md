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
agents/<name>.md (shared)
  → scanner.ts discovers top-level shared agents
  → transform.ts replaces {{tool.*}} placeholders per platform
  → transform.ts converts to target format (Markdown for skills, TOML for Codex agents)
  → installer.ts writes to platform-specific paths + copies references/
```

### Installer Source (`installer/src/`)

- `config.ts` — loads `platforms.yaml` (tool mappings, output paths, `agent_tool_map`, `profiles`) and parses `skill.yaml` manifests + agent frontmatter; `resolveAgentConfig()` translates profile+tools → per-platform config
- `scanner.ts` — walks `skills/` to find installable skills (by `skill.yaml` presence) and agents (from manifest `agents:` field); also scans top-level `agents/` for shared agents not tied to any skill
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
- `agents/` — optional skill-local sub-agents with per-platform frontmatter

Agents not tied to any specific skill live in the top-level `agents/` directory and are always installed regardless of which skills are selected.

### Skill Interdependencies

`research` → uses `{{tool.task_tracking}}` (platform-adaptive) for task tracking → spawns `code-explorer` agent for codebase exploration.
- Example placeholder patterns are platform-aware and must stay in `tool` namespace (for example `{{tool.ask_user}}` for user prompts).

### Reference Projects

`.ref/repos/` contains 9 git submodules (rpikit, hyperpowers, oh-my-claudecode, etc.) used as reference material for skill design patterns. These are read-only references, not dependencies.

## Key Conventions

- Agent frontmatter uses `profile` + `tools` (Claude tool names only). The installer resolves Gemini/Codex tool names automatically via `agent_tool_map` and looks up model/turns from `profiles` in `platforms.yaml`. Preferred structure:
  ```yaml
  profile: fast          # references a named profile in platforms.yaml
  tools: [Read, Glob, Grep]  # Claude tool names; Gemini names auto-mapped
  ```
  Legacy `platforms:` block is still supported for backward compatibility (e.g. skill-local agents that need per-platform overrides):
  ```yaml
  platforms:
    claude:
      model: claude-haiku-4-5
      tools: [Read, Glob, Grep]
      maxTurns: 12
    gemini:
      model: gemini-2.0-flash
      tools: [grep_search, glob, read_file, read_many_files, list_directory]
      max_turns: 12
    codex:
      model: o4-mini
      model_reasoning_effort: medium   # optional
  ```
  Note: `sandbox_mode` is no longer declared in agent frontmatter; it is hardcoded to `"read-only"` by the installer.
- `SKILL.md` and agent bodies use `{{tool.<key>}}` placeholders for all platform-dependent tool calls and workflow actions.
- Placeholder engine rule: only `tool.*` keys are substituted. The substitution is implemented in `transform.ts` as `{{tool.<key>}}` replacement; other Mustache-like patterns are **Non-Goal and must not be introduced**.
- When you need a platform-specific action phrase, put the full phrase in the mapping value (including spaces/prefix), not in fixed SKILL text. Example: `... questions one at a time{{tool.ask_user}}:`.
- If a platform has no equivalent tool, use empty-string mapping in `installer/platforms.yaml` (for example, Codex) so the phrase remains natural without placeholder residue.
- Mappings are defined in `installer/platforms.yaml`; every new `{{tool.<key>}}` used in source content must be added to each relevant platform or explicitly documented as intentionally missing.
- Codex agents require two files: the agent TOML + a `[agents.<name>]` entry in `.codex/config.toml`. The installer handles both.
- `installer/src/` is the source of truth. `installer/dist/` is a local build artifact and may be stale until `npm run build` is run.
- The primary language for documentation and commit messages in this project is mixed Korean/English.

## Cross-Platform Agent Porting

### Output File Formats

Use these skeletons when generating platform-specific agent files.

**Claude Code** (`.claude/agents/<agent-name>.md`):
```markdown
---
name: <AGENT_NAME>
description: <DESCRIPTION>
tools:
  - Read
  - Glob
  - Grep
model: <MODEL>
maxTurns: 12
---
<COMMON_BODY_WITH_MINIMAL_PROVIDER_LINES>
```

**Gemini CLI** (`.gemini/agents/<agent-name>.md`):
```markdown
---
name: <AGENT_NAME>
description: <DESCRIPTION>
kind: local
tools:
  - grep_search
  - glob
  - read_file
  - read_many_files
  - list_directory
model: <MODEL>
max_turns: 12
---
<COMMON_BODY_WITH_MINIMAL_PROVIDER_LINES>
```

**Codex role** (`.codex/agents/<agent-name>.toml`):
```toml
model = "<MODEL>"
model_reasoning_effort = "<REASONING_EFFORT_OR_NA>"
sandbox_mode = "read-only"
developer_instructions = """
<COMMON_BODY_WITH_MINIMAL_PROVIDER_LINES>
"""
```

If reasoning effort is N/A for a Codex conversion, omit `model_reasoning_effort`.

**Codex config registration** (`.codex/config.toml`):
```toml
[agents.<AGENT_NAME>]
description = "<DESCRIPTION>"
config_file = "agents/<AGENT_NAME>.toml"
```

Add this block only when Codex output is requested.

### Tool Name Mappings

Map source intent to provider-native tool names. Keep capability intent intact even when names differ.

| Intent | Claude Code | Gemini CLI | Codex |
| --- | --- | --- | --- |
| Keyword/code search | `Grep` | `grep_search` | `functions.exec_command` with `rg` |
| File discovery | `Glob` | `glob` + `list_directory` | `functions.exec_command` with `rg --files` or `find` |
| Symbol usage exploration | `Grep` + targeted reads | `grep_search` with symbol patterns | `functions.exec_command` with `rg` patterns |
| File read | `Read` | `read_file` + `read_many_files` | `functions.exec_command` with `sed`/`cat` |
| Parallel first search batch | parallel tool calls where available | run independent `grep_search`/`glob`/`list_directory` calls in first batch | `multi_tool_use.parallel` with multiple `functions.exec_command` calls |

### Frontmatter Requirements

**Claude Code**: `name`, `description`, `tools`, `model`, `maxTurns` (optional)

**Gemini CLI**: `name`, `description`, `kind` (`local`), `tools`, `model`, `max_turns` (optional)
- Tool names must be valid built-in Gemini CLI names. Do not emit unsupported names such as `file_search`, `list_code_usages`, or custom subagent names.

**Codex role TOML**: `model`, `model_reasoning_effort` (when confirmed), `sandbox_mode` (`read-only` for explorer-style agents), `developer_instructions` (body text)
- Codex requires two files: the agent TOML + a `[agents.<name>]` entry in `.codex/config.toml`.

| Provider | File format | Model field | Reasoning effort field |
| --- | --- | --- | --- |
| Claude Code | Markdown + YAML frontmatter | `model` | N/A |
| Gemini CLI | Markdown + YAML frontmatter | `model` | N/A |
| Codex | TOML role config | `model` | `model_reasoning_effort` |

### Porting Validation Checklist

Run after generating outputs:

1. **Clarifying answers captured** — requested providers, model per provider, and reasoning effort per provider are all explicit; report includes a provider/model/reasoning-effort summary.
2. **Requested-provider-only output** — files created only for requested providers; unrequested provider files not created or modified.
3. **Format validity** — Claude and Gemini files start with valid YAML frontmatter; Codex role file is valid TOML; if Codex is requested, `.codex/config.toml` contains the matching `[agents.<name>]` registration.
4. **Body uniformity** — generated provider bodies differ only in provider header/frontmatter or TOML keys, tool-name lines, and one tool example line; reject broad provider-specific rewrites.
5. **Mapping sanity** — tool names are valid for each provider; for Gemini, no unsupported names appear (e.g. `file_search`, `list_code_usages`, or custom subagent names); model values match clarifying answers; reasoning effort present only when the provider supports it.

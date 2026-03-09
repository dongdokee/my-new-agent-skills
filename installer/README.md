# Agent Skill Installer

Multi-platform CLI that installs agent skills and sub-agents from a single source to **Claude Code**, **Gemini CLI**, and **Codex**.

Skills are authored once in `skills/` and the installer handles platform-specific format conversion, tool name substitution, and file placement.

## Quick Start

```bash
cd installer
npm install
npm run build
cd ..
node installer/dist/index.js
```

The interactive wizard walks through these steps:

1. Select install root (`process.cwd()` or home directory)
2. Select target platforms
3. Select skills to install
4. Select agents to install
5. Select hook bundles to install
6. Select hook target platforms
7. Confirm and install

In interactive mode, every output is written under the selected install root while preserving the existing platform-relative layout such as `.claude/`, `.gemini/`, and `.codex/`.
With `--all`, the installer remains non-interactive and still installs under the current working directory.

## How It Works

```
Source (skills/research/SKILL.md)
  -> Parse SKILL.md frontmatter (name/description) + skill.yaml manifest
  -> Replace {{tool.*}} placeholders with platform-specific names
  -> Convert to target format (Markdown or TOML)
  -> Write to platform path (.claude/, .gemini/, .codex/)
  -> Copy references/ alongside if needed
```

### Output by Platform

| Platform | Skills | Agents |
|----------|--------|--------|
| Claude Code | `.claude/commands/<name>.md` | `.claude/agents/<name>.md` (YAML frontmatter) |
| Gemini CLI | `.gemini/commands/<name>.toml` | `.gemini/agents/<name>.md` (YAML frontmatter) |
| Codex | `.codex/<name>.toml` | `.codex/agents/<name>.toml` + `.codex/config.toml` registration |

### Placeholder Substitution

Use `{{tool.<key>}}` in agent body text. The installer replaces them per platform:

| Placeholder | Claude Code | Gemini CLI | Codex |
|-------------|-------------|------------|-------|
| `{{tool.search}}` | `Grep` | `grep_search` | `functions.exec_command with rg` |
| `{{tool.file_discovery}}` | `Glob` | `glob, list_directory` | `functions.exec_command with find` |
| `{{tool.file_read}}` | `Read` | `read_file, read_many_files` | `functions.exec_command with cat` |
| `{{tool.task_create}}` | `TaskCreate` | `_(reciting-task-state)_` | `update_plan` |
| `{{tool.task_update}}` | `TaskUpdate` | `_(reciting-task-state)_` | `update_plan` |

Unknown placeholders (e.g. `{{args}}`) pass through untouched.

## Adding a Skill

1. Create `skills/<name>/SKILL.md` with platform-neutral content.

2. Add `skills/<name>/skill.yaml`:

```yaml
platforms: [claude, gemini, codex]
install_as: command
include:
  - SKILL.md
  - references/    # optional
agents:
  - agents/my-agent.md  # optional
```

`name` and `description` belong in `SKILL.md` frontmatter (SSOT), not in `skill.yaml`.

3. For agents, add a `platforms:` block in the frontmatter:

```yaml
---
name: my-agent
description: "What this agent does"
platforms:
  claude:
    model: haiku
    tools: [Read, Glob, Grep]
    maxTurns: 12
  gemini:
    model: gemini-2.0-flash
    tools: [grep_search, glob, read_file, read_many_files, list_directory]
    max_turns: 12
  codex:
    model: o4-mini
    model_reasoning_effort: medium
    sandbox_mode: read-only
---
(agent body here, may use {{tool.*}} placeholders)
```

## Project Structure

```
installer/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── config.ts         # Platform + manifest types and loading
│   ├── scanner.ts        # skills/ directory scanner
│   ├── transform.ts      # Placeholder engine + format converters
│   ├── installer.ts      # Orchestration + file writing
│   ├── prompts.ts        # Interactive TUI (inquirer)
│   └── __tests__/
│       └── pipeline.test.ts
├── platforms.yaml        # Platform definitions (tools, paths, formats)
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## Development

```bash
npm run dev      # watch mode
npm test         # run tests
npm run build    # production build
```

# my-agent-skills

Skills and sub-agents authored once, installed to multiple AI coding platforms.

## What This Is

A collection of reusable AI agent skills with a CLI installer that handles platform-specific format conversion. Write a skill once in Markdown; the installer adapts it for Claude Code, Gemini CLI, and Codex.

## Skills

| Skill | Description |
|-------|-------------|
| `research` | Unified research workflow: intent discovery → codebase exploration → design synthesis → ticket authoring |
| `mapping-task-tools` | Maps generic task-tracking calls to the right platform-native tool |
| `reciting-task-state` | File-based task state (`todo.md`) for platforms without native task APIs |
| `subagent-porter` | Converts a provider-specific agent definition into multi-provider compatible outputs |

## Installation

```bash
cd installer
npm install
npm run build
cd ..
node installer/dist/index.js
```

The interactive TUI guides you through platform → skill → agent → confirm.

## Installed Output

After installation, skills appear under each platform's directory:

```
.claude/skills/<name>/<name>.md     # Claude Code
.gemini/skills/<name>/<name>.md     # Gemini CLI
.codex/skills/<name>/<name>.md      # Codex
```

Agents:

```
.claude/agents/<name>.md
.gemini/agents/<name>.md
.codex/agents/<name>.toml
.codex/config.toml                  # agent registration
```

## Authoring a Skill

```
skills/<name>/
  SKILL.md       # platform-neutral content (source of truth)
  skill.yaml     # name, platforms, includes, agent refs
  references/    # optional supporting docs, copied on install
  agents/        # optional sub-agents with per-platform frontmatter
```

Use `{{tool.<key>}}` placeholders in `SKILL.md` for platform-varying tool names. Mappings are defined in `installer/platforms.yaml`.

| Placeholder | Claude Code | Gemini CLI | Codex |
|-------------|-------------|------------|-------|
| `{{tool.search}}` | `Grep` | `grep_search` | `functions.exec_command with rg` |
| `{{tool.file_read}}` | `Read` | `read_file, read_many_files` | `functions.exec_command with cat` |
| `{{tool.task_tracking}}` | Task tools (`TaskCreate`, ...) | `reciting-task-state` skill | `update_plan` tool |

## Development

```bash
cd installer
npm test           # run tests
npm run dev        # watch mode
```

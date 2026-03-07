---
name: task-tools
description: >-
  Use this skill when asked about task management, task tool usage, or how to
  create/list/update/stop tasks in Gemini CLI. Triggers on "how do I manage
  tasks", "what task skills are available", or general task workflow questions.
---

# Task Tools Overview (Gemini CLI)

Task management is handled by a shell script (`task-manager.sh`) and a `BeforeModel` hook that auto-injects the current task list at the start of every AI turn.

## Architecture

- **`task-manager.sh`** — shell script for task CRUD; all reads/writes go through it
- **`inject-tasks.sh`** — `BeforeModel` hook; reads the session tasks file and injects a task table + usage guide into the model context each turn
- **Tasks file** — `$GEMINI_PROJECT_DIR/.tasks/$GEMINI_SESSION_ID.md` (one file per session, auto-created on first write)

## Hook Behavior

When `inject-tasks.sh` runs before each model call:
- If there are active tasks → prepends a markdown task table + management instructions to the context
- If no tasks exist → injects empty string (no overhead)

The injected guide instructs the AI: *"If there are active tasks, briefly summarize their status at the start of your response."*

## task-manager.sh Command Reference

All commands read/write `$GEMINI_PROJECT_DIR/.tasks/$GEMINI_SESSION_ID.md`.

```bash
# Create a task
bash .gemini/hooks/task-manager.sh create "<subject>" "<description>" "<activeform>" "<blockedby>" "<blocks>"

# Get task details
bash .gemini/hooks/task-manager.sh get <id>

# List tasks (optionally filter by status)
bash .gemini/hooks/task-manager.sh list [pending|in_progress|completed]

# Update task fields
bash .gemini/hooks/task-manager.sh update <id> status=in_progress
bash .gemini/hooks/task-manager.sh update <id> subject="New title" description="New desc"
bash .gemini/hooks/task-manager.sh update <id> status=deleted

# Read background process output
bash .gemini/hooks/task-manager.sh output <id> [--wait]

# Stop a running process
bash .gemini/hooks/task-manager.sh stop <id|pid>
```

## Task File Format

```
# Tasks

## #1
subject: Do X
status: pending
description: Full description
activeform: Doing X
blockedby: []
blocks: []
```

## Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Not yet started |
| `in_progress` | Currently being worked on |
| `completed` | Finished |
| `deleted` | Section removed from file |

## Installation

```bash
mkdir -p .gemini/hooks
cp skills/task-tools/hooks/task-manager.sh .gemini/hooks/
cp skills/task-tools/hooks/inject-tasks.sh .gemini/hooks/
chmod +x .gemini/hooks/*.sh
# Merge hooks/settings-snippet.json into .gemini/settings.json
```

---
name: task-tools
description: >-
  Use this skill for all task management operations (Gemini CLI only):
  creating, listing, updating, viewing output, or stopping tasks. Triggers on
  any task-related request: "add a task", "list tasks", "mark task done",
  "show task output", "stop task", "what tasks are there", or general task
  workflow questions. Provides the task tracking that Claude Code and Codex
  have built-in but Gemini CLI lacks.
---

# Task Tools (Gemini CLI)

All commands use `bash .gemini/hooks/task-manager.sh <subcommand>`.
Tasks are stored in `$GEMINI_PROJECT_DIR/.tasks/$GEMINI_SESSION_ID.md`.

## Quick Reference

```bash
# Create a task
bash .gemini/hooks/task-manager.sh create "<subject>" "<description>" "<activeform>" "<blockedby>" "<blocks>"

# Get task details
bash .gemini/hooks/task-manager.sh get <id>

# List tasks (optionally filter by status)
bash .gemini/hooks/task-manager.sh list [pending|in_progress|completed]

# Update task status (preferred aliases)
bash .gemini/hooks/task-manager.sh start <id>    # → in_progress
bash .gemini/hooks/task-manager.sh done <id>     # → completed
bash .gemini/hooks/task-manager.sh delete <id>   # → removed

# Update other fields
bash .gemini/hooks/task-manager.sh update <id> subject="New title" description="New desc"

# Read background process output
bash .gemini/hooks/task-manager.sh output <id> [--wait]

# Stop a running process
bash .gemini/hooks/task-manager.sh stop <id|pid>
```

## Usage Notes

### Create fields

- **subject** (required): one-line title
- **description** (required): purpose, scope, completion criteria
- **activeform** (optional): verb phrase shown while in progress (defaults to subject)
- **blockedby / blocks** (optional): task ID lists for dependencies, e.g. `[1, 3]`. Use `[]` for none.

### Background process convention

```bash
some-command > /tmp/tasks/<id>.output 2>&1 &
echo $! > /tmp/tasks/<id>.pid
```

Use `output <id>` to read results, `stop <id>` to terminate.

### Lifecycle rules

1. **Always `start` before `done`** -- the inject-tasks hook marks in_progress tasks in the status table so the user and model can see what is actively running. Skipping `start` breaks the dependency chain (`blockedby`/`blocks`) and leaves the status table stale.
2. **Summarize task status at response start** -- the hook instructs the model to print a one-line status summary (e.g. `Tasks: #1 ✅ #2 🔄 ...`) at the top of every response. This acts as a checkpoint so task state survives context compression and long conversations.
3. **Status values**: `pending` → `in_progress` → `completed`. `delete` removes the task entirely.

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

All commands use `bash .gemini/hooks/task-manager.sh --session <session_id> <subcommand>`.
Tasks are stored in `~/.gemini/tasks/<session_id>.md` (outside project tree).

The `inject-tasks` hook automatically extracts `session_id` from the Gemini CLI stdin JSON and injects it into the model context. The model then passes it via `--session <session_id>` when calling task-manager.sh.

## Quick Reference

```bash
# Create a task
bash .gemini/hooks/task-manager.sh --session <session_id> create "<subject>" "<description>" "<activeform>" "<blockedby>" "<blocks>"

# Get task details
bash .gemini/hooks/task-manager.sh --session <session_id> get <id>

# List tasks (optionally filter by status)
bash .gemini/hooks/task-manager.sh --session <session_id> list [pending|in_progress|completed]

# Update task status (preferred aliases)
bash .gemini/hooks/task-manager.sh --session <session_id> start <id>    # → in_progress
bash .gemini/hooks/task-manager.sh --session <session_id> done <id>     # → completed
bash .gemini/hooks/task-manager.sh --session <session_id> delete <id>   # → removed

# Update other fields
bash .gemini/hooks/task-manager.sh --session <session_id> update <id> subject="New title" description="New desc"

# Read background process output
bash .gemini/hooks/task-manager.sh --session <session_id> output <id> [--wait]

# Stop a running process
bash .gemini/hooks/task-manager.sh --session <session_id> stop <id|pid>
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
2. **Summarize task status at response start** -- the hook instructs the model to print a TaskList-style status summary at the top of every response:
   ```
   > Tasks:
   > #1 [completed] Fix type errors in src/auth/
   > #2 [in_progress] Add auth module
   > #3 [pending] Write tests (blocked by [1, 2])
   ```
   This acts as a checkpoint so task state survives context compression and long conversations.
3. **Status values**: `pending` → `in_progress` → `completed`. `delete` removes the task entirely.

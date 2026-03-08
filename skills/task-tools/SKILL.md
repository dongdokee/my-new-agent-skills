---
name: task-tools
description: >-
  Use this skill for all task management operations: creating, listing,
  updating, viewing output, or stopping tasks. Triggers on any task-related
  request: "add a task", "list tasks", "mark task done", "show task output",
  "stop task", "what tasks are there", or general task workflow questions.
---

# Task Tools (Gemini CLI)

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

## Quick Reference

All commands read/write `$GEMINI_PROJECT_DIR/.tasks/$GEMINI_SESSION_ID.md`.

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

## Creating Tasks

### Step 1. Collect fields

Ask the user for:

- **Subject** (required): one-line title
- **Description** (required): purpose, scope, and completion criteria
- **ActiveForm** (optional): verb phrase shown while in progress. Defaults to Subject.
- **BlockedBy** (optional): task IDs that must complete first. Example: `[1, 3]`
- **Blocks** (optional): task IDs that can only start after this one. Example: `[5]`

### Step 2. Call task-manager.sh

```bash
bash .gemini/hooks/task-manager.sh create "<subject>" "<description>" "<activeform>" "<blockedby>" "<blocks>"
```

Use `[]` for empty dependency lists. Quote all arguments.

### Step 3. Report result

Show the output from the script:

```
Task created: #<ID> — <Subject>
Status: pending
```

## Listing Tasks

### Step 1. Call task-manager.sh

```bash
# All tasks
bash .gemini/hooks/task-manager.sh list

# Filtered by status
bash .gemini/hooks/task-manager.sh list pending
bash .gemini/hooks/task-manager.sh list in_progress
bash .gemini/hooks/task-manager.sh list completed
```

### Step 2. Display output

Show the script output as-is. Example:

```
## In Progress
  #2  Fixing authentication bug

## Pending
  #1  Set up CI pipeline

Total: 2 tasks (1 in_progress, 1 pending, 0 completed)
```

## Getting Task Details

### Step 1. Collect task ID

Determine the task ID from the user's message. If not specified, ask:

```
Which task ID would you like to see details for?
```

### Step 2. Call task-manager.sh

```bash
bash .gemini/hooks/task-manager.sh get <id>
```

### Step 3. Display output

Show the script output as-is. Example:

```
Task #2
──────────────────────────
subject: Fixing authentication bug
status: in_progress
description: JWT token expiry handling has a bug causing login failures.
activeform: Fixing authentication bug
blockedby: []
blocks: [4]
```

## Updating Tasks

### Step 1. Collect update target

Determine:
- **Task ID** (required)
- **Fields to change**: `status`, `subject`, `description`, `activeform`, `blockedby`, `blocks`

Status values: `pending` | `in_progress` | `completed` | `deleted`

### Step 2. Call task-manager.sh

```bash
# Start a task (set status to in_progress)
bash .gemini/hooks/task-manager.sh start <id>

# Complete a task (set status to completed)
bash .gemini/hooks/task-manager.sh done <id>

# Delete a task (removes section from file)
bash .gemini/hooks/task-manager.sh delete <id>

# Update status using shorthand
bash .gemini/hooks/task-manager.sh update <id> pending

# Update other fields or multiple fields
bash .gemini/hooks/task-manager.sh update <id> subject="New title" description="New desc"
bash .gemini/hooks/task-manager.sh update <id> in_progress subject="Started work"
```

### Step 3. Report result

Show the script output:

```
Task #<ID> updated.
```

or

```
Task #<ID> deleted.
```

## Reading Process Output

### Step 1. Collect identifier

Determine the task ID or output file path from the user's message. If neither is provided, ask:

```
Which task ID or output file path would you like to check?
```

### Step 2. Call task-manager.sh

```bash
# Read current output
bash .gemini/hooks/task-manager.sh output <id>

# Block until process finishes, then read
bash .gemini/hooks/task-manager.sh output <id> --wait
```

Output files are expected at `/tmp/tasks/<id>.output`. If the file is elsewhere, read it directly with `read_file`.

### Step 3. Display output

Show the script output as-is. Long output (>50 lines) is automatically truncated to the last 50 lines.

### Background process convention

```bash
some-command > /tmp/tasks/<id>.output 2>&1 &
echo $! > /tmp/tasks/<id>.pid
```

## Stopping Processes

### Step 1. Collect identifier

Determine the task ID or PID from the user's message. If neither is provided, ask:

```
Which task ID or PID would you like to stop?
```

### Step 2. Call task-manager.sh

```bash
# By task ID (reads PID from /tmp/tasks/<id>.pid)
bash .gemini/hooks/task-manager.sh stop <id>

# By PID directly
bash .gemini/hooks/task-manager.sh stop <pid>
```

The script sends SIGTERM, waits up to 5 seconds, then escalates to SIGKILL if needed.

### Step 3. Report and offer status update

Show the script output:

```
Stopped PID <PID>.
```

Then offer to update the task status:

```
Would you like to mark task #<ID> as completed or deleted?
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

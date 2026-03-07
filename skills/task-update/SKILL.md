---
name: task-update
description: >-
  Use this skill to update an existing task's status or content. Triggers on
  "mark task done", "update task", "change task status", "set task N to
  in_progress", "delete task", "complete task N".
---

# TaskUpdate

## Procedure

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

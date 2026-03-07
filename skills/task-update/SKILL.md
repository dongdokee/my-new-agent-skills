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
# Single field
bash .gemini/hooks/task-manager.sh update <id> status=in_progress

# Multiple fields
bash .gemini/hooks/task-manager.sh update <id> status=completed subject="New title"

# Delete task (removes section from file)
bash .gemini/hooks/task-manager.sh update <id> status=deleted
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

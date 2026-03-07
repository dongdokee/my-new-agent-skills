---
name: task-list
description: >-
  Use this skill to list all tasks or filter by status. Triggers on "show
  tasks", "list tasks", "what tasks are there", "show pending tasks",
  "what's in progress".
---

# TaskList

## Procedure

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

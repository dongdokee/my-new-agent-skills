---
name: task-get
description: >-
  Use this skill to retrieve full details of a specific task by ID. Triggers on
  "get task N", "show task N", "task N details", "what is task N", "describe
  task N".
---

# TaskGet

## Procedure

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

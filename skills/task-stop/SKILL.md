---
name: task-stop
description: >-
  Use this skill to stop a running background process or task. Triggers on
  "stop task", "kill process", "cancel task N", "terminate background task",
  "stop task N".
---

# TaskStop

## Procedure

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

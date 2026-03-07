---
name: task-stop
description: >-
  Use this skill to stop a running background process or task. Triggers on
  "stop task", "kill process", "cancel task N", "terminate background task",
  "stop task N".
---

# TaskStop (file-based)

Emulates Claude Code's `TaskStop` using the `kill` command.

## Procedure

### Step 1. Collect identifier

Determine one of the following from the user's message:

- **Task ID**: the ID recorded in `.tasks/tasks.md` (used to infer the PID file)
- **PID**: directly specified process ID

If neither is specified, ask:

```
Which task ID or PID would you like to stop?
```

### Step 2. Resolve PID

**If task ID is given**:

Read the PID from the PID file using `run_shell_command`:

```bash
cat /tmp/tasks/<id>.pid
```

If the PID file does not exist:

```
PID file not found at /tmp/tasks/<id>.pid.
The process may have already exited. Please specify the PID directly.
```

**If PID is given directly**: use it as-is.

### Step 3. Check process is running

Verify the process exists with `run_shell_command`:

```bash
kill -0 <PID> 2>&1 && echo "running" || echo "not running"
```

If not running:

```
PID <PID> is not running.
```

### Step 4. Stop the process

Send the termination signal with `run_shell_command`:

```bash
kill <PID>
```

If the process does not exit within 5 seconds after SIGTERM, escalate to SIGKILL:

```bash
kill -9 <PID>
```

### Step 5. Update task status (optional)

If a task ID is available, ask the user whether to update the task's status in `.tasks/tasks.md` to `completed` or `deleted`.

### Step 6. Report result

Success:

```
Task #<ID> (PID <PID>) stopped.
```

Failure:

```
Failed to stop PID <PID>: <error message>
You may need sudo privileges.
```

## Example

User: "Stop task 3"

```bash
# Resolve PID
cat /tmp/tasks/3.pid
# → 45231

# Stop
kill 45231
```

```
Task #3 (PID 45231) stopped.
Would you like to mark task #3 as completed?
```

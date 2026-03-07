---
name: task-output
description: >-
  Use this skill to read output from a background process or task. Triggers on
  "show task output", "read background task result", "what did task N output",
  "check process output".
---

# TaskOutput

## Procedure

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

## Background process convention

```bash
some-command > /tmp/tasks/<id>.output 2>&1 &
echo $! > /tmp/tasks/<id>.pid
```

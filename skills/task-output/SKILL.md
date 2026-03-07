---
name: task-output
description: >-
  Use this skill to read output from a background process or task. Triggers on
  "show task output", "read background task result", "what did task N output",
  "check process output".
---

# TaskOutput (file-based)

Emulates Claude Code's `TaskOutput` using shell commands and file reads.

Assumes background processes write their output to a file.

## Procedure

### Step 1. Collect identifier

Determine one of the following from the user's message:

- **Task ID**: the ID recorded in `.tasks/tasks.md` (used to infer the output file path)
- **Output file path**: a directly specified file path
- **PID**: process ID (used as a hint to locate the output file)

If none are specified, ask:

```
Which task ID or output file path would you like to check?
```

### Step 2. Determine output file path

- **Task ID given**: use the default path `/tmp/tasks/<id>.output`
- **File path given directly**: use that path

### Step 3. Wait for process completion (if blocking)

If the user requests "wait until done" or "block":

Use `run_shell_command` to wait for the process to finish:

```bash
# If PID is known
tail --pid=<PID> -f /tmp/tasks/<id>.output
```

Or:

```bash
# Wait for a completion signal file
while [ ! -f /tmp/tasks/<id>.done ]; do sleep 1; done
```

### Step 4. Read the output file

Read the output file with `read_file`.

If the file does not exist:

```
/tmp/tasks/<id>.output not found.
The process may not have started yet, or it may be writing to a different path.
```

### Step 5. Display output

Show the content as-is. If the output is long, show the last 50 lines and note the total line count:

```
Task #<ID> output (<N> lines total, showing last 50):
──────────────────────────
<output content>
```

## Example

User: "Show output for task 3"

```
Task #3 output (127 lines total, showing last 50):
──────────────────────────
[2026-03-08 14:23:01] Processing file 1/10...
[2026-03-08 14:23:02] Processing file 2/10...
...
[2026-03-08 14:23:15] Done. 10 files processed.
```

## Notes

- If the output file is not at `/tmp/tasks/<id>.output`, instruct the user to specify the path directly.
- The recommended pattern for launching a background process and capturing output:
  ```bash
  some-command > /tmp/tasks/3.output 2>&1 &
  echo $! > /tmp/tasks/3.pid
  ```

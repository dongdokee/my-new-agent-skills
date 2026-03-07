---
name: task-list
description: >-
  Use this skill to list all tasks or filter by status. Triggers on "show
  tasks", "list tasks", "what tasks are there", "show pending tasks",
  "what's in progress".
---

# TaskList (file-based)

Emulates Claude Code's `TaskList` by reading `.tasks/tasks.md`.

## Procedure

### Step 1. Read the file

Read `.tasks/tasks.md` with `read_file`.

If the file does not exist: output "No tasks have been created yet. Use the `task-create` skill to add one." and stop.

### Step 2. Parse the summary table

Parse the `| ID | Subject | Status | BlockedBy | Blocks |` table at the top of the file.

### Step 3. Group by status and display

Group tasks by status. Do not display tasks with `deleted` status.

Output format:

```
## In Progress
  #2  Fixing authentication bug

## Pending
  #1  Set up CI pipeline
  #3  Write unit tests

## Completed
  #4  Update README
```

Omit any group that has no tasks.

### Step 4. Filter (optional)

If the user specifies a particular status ("show only pending", "list completed tasks"), display only that group.

### Step 5. Summary statistics

Print a one-line summary at the end:

```
Total: 4 tasks (1 in_progress, 2 pending, 1 completed)
```

## Example

With 3 tasks in `.tasks/tasks.md`:

```
## In Progress
  #2  Fixing authentication bug

## Pending
  #1  Set up CI pipeline
  #3  Write unit tests

Total: 3 tasks (1 in_progress, 2 pending, 0 completed)
```

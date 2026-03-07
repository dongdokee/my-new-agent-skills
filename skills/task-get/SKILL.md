---
name: task-get
description: >-
  Use this skill to retrieve full details of a specific task by ID. Triggers on
  "get task N", "show task N", "task N details", "what is task N", "describe
  task N".
---

# TaskGet (file-based)

Emulates Claude Code's `TaskGet` by reading `.tasks/tasks.md`.

## Procedure

### Step 1. Collect task ID

Determine the task ID from the user's message. If not specified, ask:

```
Which task ID would you like to see details for?
```

### Step 2. Read the file

Read `.tasks/tasks.md` with `read_file`.

If the file does not exist: output "`.tasks/tasks.md` not found. No tasks have been created yet." and stop.

### Step 3. Parse the section

Find the section starting with `## #<ID>` and read its full content up to the next `## #` header.

If the ID does not exist: output "Task #<ID> not found." and stop.

### Step 4. Display details

```
Task #<ID>
──────────────────────────
Subject     : <Subject>
Status      : <Status>
Description : <Description>
ActiveForm  : <ActiveForm>
BlockedBy   : <BlockedBy>
Blocks      : <Blocks>
```

### Step 5. Resolve dependencies (optional)

If BlockedBy or Blocks contain IDs, look up the Subject of each referenced task and display it inline:

```
BlockedBy   : [2] — Set up CI pipeline
Blocks      : [5] — Deploy to staging
```

## Example

User: "Show me task #2"

```
Task #2
──────────────────────────
Subject     : Fixing authentication bug
Status      : in_progress
Description : JWT token expiry handling has a bug causing login failures. Investigate and fix.
ActiveForm  : Fixing authentication bug
BlockedBy   : []
Blocks      : [4] — Deploy to staging
```

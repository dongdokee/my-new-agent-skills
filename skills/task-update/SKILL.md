---
name: task-update
description: >-
  Use this skill to update an existing task's status or content. Triggers on
  "mark task done", "update task", "change task status", "set task N to
  in_progress", "delete task", "complete task N".
---

# TaskUpdate (file-based)

Emulates Claude Code's `TaskUpdate` by modifying `.tasks/tasks.md`.

## Procedure

### Step 1. Collect update target

Determine the following from the user's message:

- **Task ID** (required)
- **Fields to change** (one or more):
  - `status`: `pending` / `in_progress` / `completed` / `deleted`
  - `subject`: new title
  - `description`: new description
  - `activeForm`: new in-progress display phrase
  - `addBlockedBy`: IDs to add to BlockedBy
  - `addBlocks`: IDs to add to Blocks
  - `removeBlockedBy`: IDs to remove from BlockedBy
  - `removeBlocks`: IDs to remove from Blocks

Ask for any missing information.

### Step 2. Read the file

Read `.tasks/tasks.md` with `read_file`.

If the task ID does not exist: output "Task #<ID> not found." and stop.

### Step 3. Handle status: deleted

When `status: deleted`:
1. Remove the corresponding row from the summary table
2. Remove the entire `## #<ID>` section (up to the next `## #` or end of file)
3. Save with `write_file`
4. Output "Task #<ID> deleted." and stop

### Step 4. Update general fields

**Summary table row**: update the changed fields (subject, status, blockedBy, blocks) in the row matching the ID.

**Detail section**: replace the value of each changed field in the `## #<ID>` section.

Example — changing status to `in_progress`:
- Table row: `| 2 | Fixing auth bug | in_progress | - | - |`
- Section: `**Status**: in_progress`

Save the changed portions with `replace`.

### Step 5. Report result

```
Task #<ID> updated:
  status: pending → in_progress
```

List only the fields that changed.

## Examples

**Example 1: Status change**

User: "Set task 2 to in_progress"

```
Task #2 updated:
  status: pending → in_progress
```

**Example 2: Mark complete**

User: "Mark task 1 as done"

```
Task #1 updated:
  status: in_progress → completed
```

**Example 3: Delete**

User: "Delete task 3"

```
Task #3 deleted.
```

(Both the table row and the `## #3` section are removed)

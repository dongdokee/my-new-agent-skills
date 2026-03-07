---
name: task-create
description: >-
  Use this skill to create a new task entry. Triggers on "add a task", "create
  task", "new task", "record a to-do", or any request to track a new work item.
---

# TaskCreate (file-based)

Emulates Claude Code's `TaskCreate` by writing to `.tasks/tasks.md`.

## Procedure

### Step 1. Collect fields

Ask the user for the following:

- **Subject** (required): one-line title summarizing the task
- **Description** (required): full description — purpose, scope, and completion criteria
- **ActiveForm** (optional): verb phrase to display while the task is in progress. Example: "Fixing authentication bug". Defaults to Subject if not provided.
- **BlockedBy** (optional): list of task IDs that must be completed before this task starts. Example: `[1, 3]`
- **Blocks** (optional): list of task IDs that can only start after this task is completed. Example: `[5]`

### Step 2. Read or initialize the file

Read `.tasks/tasks.md` with `read_file`.

If the file does not exist, create it with the following initial content:

```markdown
# Tasks

| ID | Subject | Status | BlockedBy | Blocks |
|----|---------|--------|-----------|--------|

---
```

### Step 3. Calculate the new ID

Read all existing IDs from the summary table and use max + 1 as the new ID. If there are no tasks, use ID = 1.

### Step 4. Update the file

**Add a row to the summary table** (after the last existing row):

```
| <ID> | <Subject> | pending | <BlockedBy or -> | <Blocks or -> |
```

**Add a detail section** (after the `---` separator, following any existing sections):

```markdown
## #<ID>

**Subject**: <Subject>
**Status**: pending
**Description**: <Description>
**ActiveForm**: <ActiveForm>
**BlockedBy**: <BlockedBy list or []>
**Blocks**: <Blocks list or []>
```

Save the file with `write_file` or `replace`.

### Step 5. Report result

```
Task created: #<ID> — <Subject>
Status: pending
```

## Example

User: "Create a task to fix the login bug"

```
Task created: #3 — Fix login bug
Status: pending
```

Changes to `.tasks/tasks.md`:
- Row added to table: `| 3 | Fix login bug | pending | - | - |`
- Section `## #3` appended

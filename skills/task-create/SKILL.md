---
name: task-create
description: >-
  Use this skill to create a new task entry. Triggers on "add a task", "create
  task", "new task", "record a to-do", or any request to track a new work item.
---

# TaskCreate

## Procedure

### Step 1. Collect fields

Ask the user for:

- **Subject** (required): one-line title
- **Description** (required): purpose, scope, and completion criteria
- **ActiveForm** (optional): verb phrase shown while in progress. Defaults to Subject.
- **BlockedBy** (optional): task IDs that must complete first. Example: `[1, 3]`
- **Blocks** (optional): task IDs that can only start after this one. Example: `[5]`

### Step 2. Call task-manager.sh

```bash
bash .gemini/hooks/task-manager.sh create "<subject>" "<description>" "<activeform>" "<blockedby>" "<blocks>"
```

Use `[]` for empty dependency lists. Quote all arguments.

### Step 3. Report result

Show the output from the script:

```
Task created: #<ID> — <Subject>
Status: pending
```

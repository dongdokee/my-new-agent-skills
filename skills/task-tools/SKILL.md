---
name: task-tools
description: >-
  Use this skill when asked about task management, task tool usage, or how to
  create/list/update/stop tasks in Gemini CLI. Triggers on "how do I manage
  tasks", "what task skills are available", or general task workflow questions.
---

# Task Tools Overview (Gemini CLI)

Claude Code's Task tools (TaskCreate, TaskGet, TaskUpdate, TaskList, TaskOutput, TaskStop) are not built into Gemini CLI. This skill set emulates the same workflow using a file-based task store at `.tasks/tasks.md`.

## Data Store

**Location**: `.tasks/tasks.md` (project root)

**Format**:

```markdown
# Tasks

| ID | Subject | Status | BlockedBy | Blocks |
|----|---------|--------|-----------|--------|
| 1  | Do X    | pending | - | - |

---

## #1

**Subject**: Do X
**Status**: pending
**Description**: Full description here
**ActiveForm**: Doing X
**BlockedBy**: []
**Blocks**: []
```

- **Summary table** (top): quick scan of all tasks — ID, subject, status, dependencies.
- **Detail sections** (bottom): one `## #<ID>` section per task with all fields.
- **ID**: auto-incremented (max existing ID + 1). IDs of deleted tasks are never reused.

## Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Not yet started |
| `in_progress` | Currently being worked on |
| `completed` | Finished |
| `deleted` | Removed (section deleted from file) |

## When to Use Each Skill

| Skill | When to use | Claude Code equivalent |
|-------|-------------|----------------------|
| `task-create` | Add a new task | TaskCreate |
| `task-list` | View all tasks | TaskList |
| `task-get` | View details of a specific task | TaskGet |
| `task-update` | Change task status or content | TaskUpdate |
| `task-output` | Read background process output | TaskOutput |
| `task-stop` | Stop a running process | TaskStop |

## Dependency Fields

- **BlockedBy**: IDs of tasks that must be completed before this task can start. Example: `[2, 3]`
- **Blocks**: IDs of tasks that cannot start until this task is completed. Example: `[5]`
- Use `[]` or `-` when there are no dependencies.

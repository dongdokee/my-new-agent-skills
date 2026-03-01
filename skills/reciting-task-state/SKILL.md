---
name: reciting-task-state
description: Use this when your platform has no native task-tracking tool (no TaskCreate, no update_plan).
---

# Reciting Task State

## Purpose

When your platform provides no task-tracking tool, you act as the task tool by writing and re-reading a `todo.md` file every turn. This keeps the active tasks in the highest-attention part of context and prevents task drift.

## When to Use

- Use when you need to preserve cross-turn task continuity on platforms without native task APIs.
- Use when context-window effects repeatedly cause early-turn tasks to be forgotten.

## When Not to Use

- Use native tracking tools when available (`TaskCreate`, `update_plan`, etc.).
- Avoid for one-off commands that do not change or require future state.

## Why This Works

Transformer models attend unevenly across context length:

- **Recency bias.** Tokens near the end of context get more attention.
- **Lost-in-the-middle.** Mid-context retrieval is weaker than near edges.
- **File survives compression.** A small state file can be reloaded to restore details after compression.
- **Lower token cost for descriptions.** Detailed task notes are stored in file and only re-read as needed.

## Format

```markdown
todo.md:
- [x] Implement auth module
- [~] Add unit tests ← current
  Run unit tests for auth module, cover edge cases
- [ ] Update API docs
  Document new endpoints in OpenAPI spec
```

| Marker | Meaning |
|--------|---------|
| `- [ ]` | pending |
| `- [~]` | in_progress (append `← current`) |
| `- [x]` | completed |

Indent description lines under each task. Keep descriptions short (one or two lines).
Exactly one task may be marked `[~]` and annotated with `← current`.

## Process

### 1. Setup

1. Write `todo.md` to `/home/dd/.gemini/tmp/<project>/<session-uuid>/todo.md` (never the project root).
2. Ensure the file contains the full task list, including unchanged completed items.

### 2. Every active turn

1. **Read** the full current `todo.md` at turn start.
2. If state changes, **Write** the full updated `todo.md` in a separate tool call.
3. Optionally **Read back** after write when verification is needed.

### 3. Per-task state transitions

1. Mark starting task as `[~]` + `← current`.
2. On completion, move it to `[x]`, then mark the next task as `[~]` + `← current`.

### 4. Skill handoff

1. Mark all current phase tasks `[x]`.
2. Append the next skill section and tasks below previous history; do not replace the file.

## File Location (Gemini CLI only)

Write `todo.md` only to:

- `/home/dd/.gemini/tmp/<project>/<session-uuid>/todo.md`

Rules:

- `<session-uuid>` MUST be the active Gemini CLI session directory name.
- Do not use PID-, timestamp-, or bare-name paths (for example: `/tmp/todo.md`, `todo-<pid>.md`).
- Never write `todo.md` inside the project repository.

## Safety / Guardrails

- Always read the full task file at the start of any active turn.
- On state changes, always write the full task file (no partial writes).
- Write and read must be separate tool calls.
- Never write in the project directory.
- Never use any path except `/home/dd/.gemini/tmp/<project>/<session-uuid>/todo.md`.
- `<session-uuid>` must match the active Gemini CLI session directory name.
- Never use PID-, timestamp-, or bare-name paths.
- Never use partial writes; always keep completed and unchanged tasks in the file.
- Never replace history on skill transitions.

## Anti-Patterns

- Omitting turn-start read on active turns.
- Skipping full-file write after a state change.
- Using partial task writes.
- Selective tracking (ignoring "small" tasks).
- Writing todo files in repository paths.
- Writing and reading in the same tool call.
- Using PID-, timestamp-, or bare-name paths.
- Replacing history during a skill transition.

## Integration

- If a new skill starts, append its section at the end of `todo.md`.
- If this skill activates in a new turn, begin the next response with the `Process` turn-start read before acting.

## Checklist

- [x] todo file is under `/home/dd/.gemini/tmp/<project>/<session-uuid>/` and outside repo.
- [x] every active turn starts with a full-file read.
- [x] full state is written on every state change.
- [x] write/read are done in separate tool calls.
- [x] state markers correctly updated (`[ ]`, `[~]`, `[x]`).

# Reciting Task State Redesign Implementation Plan

**REQUIRED SUB-AGENTS:** Launch `code-reviewer` agent in the review step, focusing on
- simplicity/DRY/elegance
- bugs/functional correctness
- project conventions/abstractions

**REQUIRED SUB-SKILL:** Invoke `test-driven-development` to understand TDD-driven task structure

**Ticket:** `docs/plans/2026-03-03-reciting-task-state-evaluation-ticket.md`

**Goal:** Transition the `reciting-task-state` skill from a monolithic `todo.md` file to a directory-based state machine for improved reliability and token efficiency.

**Architecture:** Use a directory structure (`tasks/pending/`, `tasks/current/`, `tasks/done/`) where each task is a separate Markdown file. Transitions are performed via atomic `mv` operations.

**Tech Stack:** Markdown (Instructions), Bash (Operations).

**Branch:** `feature/reciting-task-state-redesign`

---

### Task 1: Update SKILL.md Header and Purpose

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md:1-20`

**Step 1: Write the failing test**

```bash
# tests/verify_purpose.sh
grep -q "directory-based state machine" skills/reciting-task-state/SKILL.md || exit 1
```

**Step 2: Run test to verify it fails**

Run: `bash tests/verify_purpose.sh`
Expected: FAIL

**Step 3: Write minimal implementation**

```markdown
# Reciting Task State

## Purpose

When your platform provides no task-tracking tool, you act as the task tool by maintaining a directory-based state machine of task files. This keeps the active task in the highest-attention part of context, prevents task drift, and ensures atomic state transitions.
```

**Step 4: Run test to verify it passes**

Run: `bash tests/verify_purpose.sh`
Expected: PASS

**Step 5: Review, refactor, and verify**

1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: Apply improvements.
3. **Verify**: `bash tests/verify_purpose.sh`

**Step 6: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: update reciting-task-state purpose for directory-based state"
```

---

### Task 2: Redesign Format Section

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md:40-60`

**Step 1: Write the failing test**

```bash
# tests/verify_format.sh
grep -q "tasks/pending" skills/reciting-task-state/SKILL.md || exit 1
grep -q "tasks/current" skills/reciting-task-state/SKILL.md || exit 1
grep -q "tasks/done" skills/reciting-task-state/SKILL.md || exit 1
```

**Step 2: Run test to verify it fails**

Run: `bash tests/verify_format.sh`
Expected: FAIL

**Step 3: Write minimal implementation**

```markdown
## Format

Each task is a separate Markdown file within the following directory structure:

- `tasks/pending/`: Tasks waiting to be started.
- `tasks/current/`: The SINGLE active task (LIMIT 1 file).
- `tasks/done/`: Completed tasks.

### Task File Content
Filename: `<id>-<slug>.md` (e.g., `01-setup-auth.md`)

```markdown
# <Task Title>
- [ ] Sub-task 1
- [ ] Sub-task 2

Notes:
<Detailed implementation notes>
```
```

**Step 4: Run test to verify it passes**

Run: `bash tests/verify_format.sh`
Expected: PASS

**Step 5: Review, refactor, and verify**

1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: Apply improvements.
3. **Verify**: `bash tests/verify_format.sh`

**Step 6: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: define directory-based task format"
```

---

### Task 3: Update Process Section for Atomic Moves

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md:65-100`

**Step 1: Write the failing test**

```bash
# tests/verify_process.sh
grep -q "mkdir -p tasks" skills/reciting-task-state/SKILL.md || exit 1
grep -q "mv tasks/pending" skills/reciting-task-state/SKILL.md || exit 1
grep -q "mv tasks/current" skills/reciting-task-state/SKILL.md || exit 1
```

**Step 2: Run test to verify it fails**

Run: `bash tests/verify_process.sh`
Expected: FAIL

**Step 3: Write minimal implementation**

```markdown
## Process

### 1. Setup
1. Create the directory structure: `mkdir -p <project-tmp-dir>/<session-uuid>/tasks/{pending,current,done}`.
2. Create initial task files in `tasks/pending/`.

### 2. Every active turn
1. **List** `tasks/current/` to find the active task.
2. **Read** the active task file at turn start.
3. If no file is in `tasks/current/`, list `tasks/pending/` and move the next task to `current/`.

### 3. Task State Transitions
1. **Start Task**: `mv tasks/pending/<task>.md tasks/current/`
2. **Update Task**: Overwrite the file in `tasks/current/` with updated notes/sub-tasks.
3. **Complete Task**: `mv tasks/current/<task>.md tasks/done/`

### 4. Skill Handoff
1. Ensure `tasks/current/` is empty (all tasks moved to `done/`).
2. New skill tasks are initialized in `tasks/pending/`.
```

**Step 4: Run test to verify it passes**

Run: `bash tests/verify_process.sh`
Expected: PASS

**Step 5: Review, refactor, and verify**

1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: Apply improvements.
3. **Verify**: `bash tests/verify_process.sh`

**Step 6: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: update process for atomic task moves"
```

---

### Task 4: Update Safety and Guardrails

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md:110-140`

**Step 1: Write the failing test**

```bash
# tests/verify_guardrails.sh
grep -q "Exactly one file in tasks/current" skills/reciting-task-state/SKILL.md || exit 1
```

**Step 2: Run test to verify it fails**

Run: `bash tests/verify_guardrails.sh`
Expected: FAIL

**Step 3: Write minimal implementation**

```markdown
## Safety / Guardrails

- **Single Active Task**: Exactly one file may exist in `tasks/current/` at any time.
- **Atomic Moves**: Always use `mv` for state transitions to prevent data loss.
- **No Repository Pollution**: Never create `tasks/` inside the project repository.
- **Turn-Start Sync**: Always list `tasks/current/` and read the file at the start of an active turn.
- **Path Integrity**: Only use `<project-tmp-dir>/<session-uuid>/tasks/`.
```

**Step 4: Run test to verify it passes**

Run: `bash tests/verify_guardrails.sh`
Expected: PASS

**Step 5: Review, refactor, and verify**

1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: Apply improvements.
3. **Verify**: `bash tests/verify_guardrails.sh`

**Step 6: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: add guardrails for directory-based state"
```

---

### Task 5: Final Verification and Cleanup

**Step 1: Run all verification tests**

```bash
bash tests/verify_purpose.sh
bash tests/verify_format.sh
bash tests/verify_process.sh
bash tests/verify_guardrails.sh
```

**Step 2: Remove test scripts**

```bash
rm -rf tests/
```

**Step 3: Commit final state**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: finalize reciting-task-state redesign"
```

# Reciting Task State Evaluation Implementation Plan

**Ticket:** `docs/plans/2026-03-03-reciting-task-state-evaluation-ticket.md`

**Goal:** Transition the `reciting-task-state` skill from a monolithic `todo.md` to a directory-based state machine.

**Architecture:** The new design uses three directories (`pending/`, `current/`, `done/`) within the session's temporary directory. Each task is a separate markdown file. Transitions are performed via atomic `mv` commands, ensuring state integrity and reducing token usage by only reading the active task.

**Tech Stack:** Markdown (SKILL.md), Shell commands (mkdir, mv, ls).

---

### Task 1: Update SKILL.md Purpose and Setup Sections

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Write the failing test**

```bash
grep -q "tasks/pending" skills/reciting-task-state/SKILL.md || (echo "FAIL: pending dir not mentioned" && exit 1)
```

**Step 2: Run test to verify it fails**

Run: `grep -q "tasks/pending" skills/reciting-task-state/SKILL.md || echo "FAIL"`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Update `Purpose` and `Setup` sections in `skills/reciting-task-state/SKILL.md` to mention the new directory structure and the `mkdir -p tasks/{pending,current,done}` command.

**Step 4: Run test to verify it passes**

Run: `grep -q "tasks/pending" skills/reciting-task-state/SKILL.md && echo "PASS"`
Expected: `PASS`

**Step 5: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs(skill): update reciting-task-state to directory-based setup"
```

---

### Task 2: Update SKILL.md Process and Rules

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Write the failing test**

```bash
grep -q "mv tasks/pending/" skills/reciting-task-state/SKILL.md || (echo "FAIL: mv command not mentioned" && exit 1)
```

**Step 2: Run test to verify it fails**

Run: `grep -q "mv tasks/pending/" skills/reciting-task-state/SKILL.md || echo "FAIL"`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Update `Process` and `Safety / Guardrails` sections to include rules for moving tasks between directories and the "single file in current/" rule.

**Step 4: Run test to verify it passes**

Run: `grep -q "mv tasks/pending/" skills/reciting-task-state/SKILL.md && echo "PASS"`
Expected: `PASS`

**Step 5: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs(skill): define directory-based state transitions in reciting-task-state"
```

---

### Task 3: Update SKILL.md Format and Anti-Patterns

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Write the failing test**

```bash
grep -q "tasks/current/" skills/reciting-task-state/SKILL.md || (echo "FAIL: format section not updated" && exit 1)
```

**Step 2: Run test to verify it fails**

Run: `grep -q "tasks/current/" skills/reciting-task-state/SKILL.md || echo "FAIL"`
Expected: `FAIL`

**Step 3: Write minimal implementation**

Update `Format` and `Anti-Patterns` sections to reflect the new per-file format and anti-patterns like "Selective tracking" or "Monolithic file rewrite".

**Step 4: Run test to verify it passes**

Run: `grep -q "tasks/current/" skills/reciting-task-state/SKILL.md && echo "PASS"`
Expected: `PASS`

**Step 5: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs(skill): update format and anti-patterns for directory-based state"
```

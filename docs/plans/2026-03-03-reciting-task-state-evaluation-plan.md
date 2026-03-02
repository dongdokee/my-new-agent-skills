# Directory-Based State Machine for reciting-task-state Implementation Plan

**REQUIRED SUB-AGENTS:** Launch `code-reviewer` agent in the review step, focusing on
- simplicity/DRY/elegance
- bugs/functional correctness
- project conventions/abstractions

**Ticket:** `docs/plans/2026-03-03-reciting-task-state-evaluation-ticket.md`

**Goal:** Transition the `reciting-task-state` skill from a monolithic `todo.md` file to a directory-based state machine (`pending/`, `current/`, `done/`) for improved reliability and token efficiency.

**Architecture:** Use a directory structure where each task is an individual markdown file. Transitions between states (pending -> current -> done) are performed using atomic `mv` commands. The system enforces a limit of exactly one active task in the `current/` directory.

**Tech Stack:** Markdown (SKILL.md), Shell commands (`mkdir`, `mv`, `ls`, `rm`), Gemini CLI tools (`read_file`, `write_file`, `list_directory`).

---

### Task 1: Create State Machine Verification Script

**Files:**
- Create: `skills/reciting-task-state/tests/verify-state.sh`

**Step 1: Write the failing test**

```bash
#!/bin/bash
# skills/reciting-task-state/tests/verify-state.sh
# Verifies the directory-based state machine invariants.

STATE_DIR=$1
if [ -z "$STATE_DIR" ]; then
    echo "Usage: $0 <state-directory>"
    exit 1
fi

# Invariant 1: Directories must exist
for dir in pending current done; do
    if [ ! -d "$STATE_DIR/tasks/$dir" ]; then
        echo "FAIL: Directory tasks/$dir missing"
        exit 1
    fi
done

# Invariant 2: At most one file in current/
CURRENT_COUNT=$(ls -1 "$STATE_DIR/tasks/current" 2>/dev/null | wc -l)
if [ "$CURRENT_COUNT" -gt 1 ]; then
    echo "FAIL: More than one task in tasks/current ($CURRENT_COUNT found)"
    exit 1
fi

echo "PASS: State machine invariants satisfied"
exit 0
```

**Step 2: Run test to verify it fails**

Run: `mkdir -p /tmp/test-state && bash skills/reciting-task-state/tests/verify-state.sh /tmp/test-state`
Expected: FAIL with "FAIL: Directory tasks/pending missing"

**Step 3: Write minimal implementation**

(The script itself is the implementation of the verification tool).
Ensure the script is executable.

**Step 4: Run test to verify it passes**

Run: `mkdir -p /tmp/test-state/tasks/{pending,current,done} && bash skills/reciting-task-state/tests/verify-state.sh /tmp/test-state`
Expected: PASS: State machine invariants satisfied

**Step 5: Review, refactor, and verify**

1. **Review**: Launch `code-reviewer` agent on the shell script.
2. **Refactor**: Apply any improvements (e.g., adding more detailed error messages).
3. **Verify**: Run the script again on the valid and invalid structures.

**Step 6: Commit**

```bash
git add skills/reciting-task-state/tests/verify-state.sh
git commit -m "test: add state machine verification script"
```

---

### Task 2: Update SKILL.md Header, Purpose, and Format

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Write the failing test**

Manual verification: The current `SKILL.md` still describes the monolithic `todo.md` format.
Run: `grep "todo.md" skills/reciting-task-state/SKILL.md`
Expected: Matches found (needs to be replaced).

**Step 2: Run test to verify it fails**

(Confirmed above: it still contains the old format).

**Step 3: Write minimal implementation**

Update the "Purpose", "Why This Works", and "Format" sections to describe the directory structure.

```markdown
# Reciting Task State

## Purpose
When your platform provides no task-tracking tool, you act as the task tool by maintaining a directory-based state machine in the project's temporary directory. This keeps the active task in the highest-attention part of context and prevents task drift.

## Format
The state is stored in a `tasks/` directory with three subdirectories:
- `tasks/pending/`: Tasks waiting to be started.
- `tasks/current/`: The single active task (limit 1 file).
- `tasks/done/`: Completed tasks.

Each task is a separate `.md` file (e.g., `01-setup.md`) containing its specific sub-tasks and notes.
```

**Step 4: Run test to verify it passes**

Run: `grep "tasks/pending" skills/reciting-task-state/SKILL.md`
Expected: Matches found.

**Step 5: Review, refactor, and verify**

1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: Ensure the "Format" section clearly explains the new structure.
3. **Verify**: Check that no references to the old `todo.md` format remain in the updated sections.

**Step 6: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: update reciting-task-state purpose and format to directory-based"
```

---

### Task 3: Update SKILL.md Process Section (Setup & Transitions)

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Write the failing test**

Manual verification: The "Process" section still mandates reading/writing a full `todo.md`.
Run: `grep "Write full updated todo.md" skills/reciting-task-state/SKILL.md`
Expected: Match found.

**Step 2: Run test to verify it fails**

(Confirmed above).

**Step 3: Write minimal implementation**

Update the "Process" section to use `mkdir` and `mv`.

```markdown
## Process

### 1. Setup
1. Create the directory structure in `<project-tmp-dir>/<session-uuid>/tasks/{pending,current,done}`.
2. Create initial task files in `tasks/pending/`, numbered for order (e.g., `01-setup.md`).

### 2. Every active turn
1. **List** `tasks/current/` to identify the active task.
2. **Read** the active task file from `tasks/current/`.
3. If state changes, **Update** the active task file via `write_file`.

### 3. Per-task state transitions
1. **Start**: `mv tasks/pending/NN-name.md tasks/current/` (ensure `current/` was empty).
2. **Complete**: `mv tasks/current/NN-name.md tasks/done/`.
```

**Step 4: Run test to verify it passes**

Run: `grep "mv tasks/pending" skills/reciting-task-state/SKILL.md`
Expected: Match found.

**Step 5: Review, refactor, and verify**

1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: Ensure transitions are described as atomic operations.
3. **Verify**: Check that the instructions for "Every active turn" are concise.

**Step 6: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: update reciting-task-state process for directory-based transitions"
```

---

### Task 4: Update SKILL.md Guardrails, Anti-Patterns, and Checklist

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Write the failing test**

Manual verification: Guardrails still mention "Never use partial writes" in the context of `todo.md`.
Run: `grep "partial task writes" skills/reciting-task-state/SKILL.md`
Expected: Match found.

**Step 2: Run test to verify it fails**

(Confirmed above).

**Step 3: Write minimal implementation**

Update "Safety / Guardrails", "Anti-Patterns", and "Checklist" to match the new architecture.

```markdown
## Safety / Guardrails
- Always check that `tasks/current/` contains exactly one file before starting a new task.
- Use atomic `mv` commands for all state transitions.
- Never write task state inside the project repository.
- Use the full path: `<project-tmp-dir>/<session-uuid>/tasks/...`

## Anti-Patterns
- Having multiple files in `tasks/current/`.
- Manually editing files in `tasks/done/`.
- Deleting tasks instead of moving them to `done/`.

## Checklist
- [x] Directory structure exists under `<project-tmp-dir>/<session-uuid>/`.
- [x] Exactly one active task in `current/`.
- [x] Transitions performed via `mv`.
```

**Step 4: Run test to verify it passes**

Run: `grep "Exactly one active task in current" skills/reciting-task-state/SKILL.md`
Expected: Match found.

**Step 5: Review, refactor, and verify**

1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: Consolidate redundant rules.
3. **Verify**: Ensure the checklist is easy for an agent to follow.

**Step 6: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: finalize reciting-task-state guardrails and checklist"
```

---

### Task 5: End-to-End Verification

**Files:**
- Modify: `skills/reciting-task-state/tests/verify-state.sh` (if needed)

**Step 1: Write the failing test**

We will perform a manual "dry run" of the new skill.
1. Create a dummy state directory.
2. Follow the "Setup" instructions.
3. Follow a "Transition" instruction.
4. Run `bash skills/reciting-task-state/tests/verify-state.sh` at each step.

**Step 2: Run test to verify it fails**

Run `verify-state.sh` on an empty dir: should fail.

**Step 3: Write minimal implementation**

Ensure all steps in the dry run succeed.

**Step 4: Run test to verify it passes**

Run `verify-state.sh` after the transition: should pass.

**Step 5: Review, refactor, and verify**

1. **Review**: Check the `SKILL.md` one last time for any leftover `todo.md` references.
2. **Refactor**: Fix any inconsistencies.
3. **Verify**: Run `grep -r "todo.md" skills/reciting-task-state/` to ensure absolute cleanup.

**Step 6: Commit**

```bash
git commit -m "test: complete end-to-end verification of new skill format"
```

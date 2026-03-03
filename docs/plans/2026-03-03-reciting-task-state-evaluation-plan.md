# Reciting Task State Implementation Plan (Directory-Based)

**REQUIRED SUB-AGENTS:** Launch `code-reviewer` agent in the review step, focusing on
- simplicity/DRY/elegance
- bugs/functional correctness
- project conventions/abstractions

**REQUIRED SUB-SKILL:** Invoke `test-driven-development` to understand TDD-driven task structure

**Ticket:** `docs/plans/2026-03-03-reciting-task-state-evaluation-ticket.md`

**Goal:** Transition the `reciting-task-state` skill from a single monolithic `todo.md` file to a robust, directory-based state machine (`tasks/pending/`, `tasks/current/`, `tasks/done/`).

**Architecture:** 
- Each task is stored as an individual Markdown file within a status-specific directory.
- State transitions are performed using atomic file system moves (`mv`).
- The agent only reads the active task's file, reducing context usage and improving reliability.

**Tech Stack:** Markdown, Shell (bash), Node.js (for installer validation)

**Branch:** `feature/reciting-task-state-evolution`

---

### Task 1: Create Validation Script (RED)

**Files:**
- Create: `scripts/verify-task-state.sh`

**Step 1: Write the failing test**

Create a bash script that verifies the new directory-based task structure. It should fail if the structure is missing or if the "exactly one current task" rule is violated.

```bash
#!/bin/bash
# scripts/verify-task-state.sh

BASE_DIR=$1
if [ -z "$BASE_DIR" ]; then
  echo "Usage: $0 <base-task-dir>"
  exit 1
fi

# Check for required directories
for dir in pending current done; do
  if [ ! -d "$BASE_DIR/tasks/$dir" ]; then
    echo "FAIL: Directory $BASE_DIR/tasks/$dir is missing"
    exit 1
  fi
done

# Check for exactly one file in 'current'
CURRENT_COUNT=$(ls -1 "$BASE_DIR/tasks/current" 2>/dev/null | wc -l)
if [ "$CURRENT_COUNT" -ne 1 ]; then
  echo "FAIL: Expected exactly 1 task in 'current', found $CURRENT_COUNT"
  exit 1
fi

echo "PASS: Task state structure is valid"
exit 0
```

**Step 2: Run test to verify it fails**

Run: `mkdir -p tmp/test-session && bash scripts/verify-task-state.sh tmp/test-session`
Expected: FAIL with "Directory tmp/test-session/tasks/pending is missing"

**Step 3: Commit**

```bash
git add scripts/verify-task-state.sh
git commit -m "test: add task state validation script"
```

### Task 2: Rewrite SKILL.md (GREEN)

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Implement the new directory-based instructions**

Replace the monolithic `todo.md` logic with the directory-based state machine.

```markdown
---
name: reciting-task-state
description: Use this when your platform has no native task-tracking tool (no TaskCreate, no update_plan).
---

# Reciting Task State

## Purpose

When your platform provides no task-tracking tool, you act as the task tool by maintaining a directory-based task state machine in the project's temporary directory. This ensures resilience against data corruption and improves token efficiency.

## Format

- **`tasks/pending/`**: Tasks waiting to be started.
- **`tasks/current/`**: The single active task (exactly one file).
- **`tasks/done/`**: Completed tasks.

Each task is a `.md` file (e.g., `01-setup.md`).
Content:
```markdown
# [Task Name]
- [ ] Sub-task 1
- [ ] Sub-task 2
Notes: ...
```

## Process

### 1. Setup

1. Create the structure: `mkdir -p <project-tmp-dir>/<session-uuid>/tasks/{pending,current,done}`.
2. Initialize tasks as individual files in `tasks/pending/`.
3. Move the first task to `tasks/current/`: `mv tasks/pending/01-init.md tasks/current/`.

### 2. Every active turn

1. **List** tasks to see state: `ls -R tasks/`.
2. **Read** the single file in `tasks/current/` at turn start.
3. If state changes, **Update** the file in `tasks/current/`.

### 3. Per-task state transitions

1. **Complete**: `mv tasks/current/<task>.md tasks/done/`.
2. **Start Next**: `mv tasks/pending/<next-task>.md tasks/current/`.

## Rules

- NEVER write to the project repository.
- Exactly ONE file in `tasks/current/` at all times during active work.
- Use atomic `mv` for state transitions.
- Read only the current task file to save tokens.

... (rest of the file remains focused on Gemini CLI specifics)
```

**Step 2: Run test to verify it passes (Manually simulated)**

1. Simulate setup: `mkdir -p tmp/test-session/tasks/{pending,current,done}`
2. Create a dummy task: `touch tmp/test-session/tasks/current/01-test.md`
3. Run: `bash scripts/verify-task-state.sh tmp/test-session`
Expected: PASS

**Step 3: Review, refactor, and verify**

STRICTLY follow `Review` - `Refactor` - `Verify` cycle.

1. **Review**: Launch `code-reviewer` agent to check the clarity of the new `SKILL.md`.
2. **Refactor**: Simplify instructions if they are too verbose.
3. **Verify**: Ensure the validation script still passes.

**Step 4: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "feat: transition to directory-based state machine"
```

### Task 3: Add Validation Logic to Installer (Phase 3)

**Files:**
- Modify: `installer/src/installer.ts`
- Create: `installer/src/__tests__/validator.test.ts`

**Step 1: Write the failing test**

```typescript
// installer/src/__tests__/validator.test.ts
import { validateTaskStructure } from "../validator";
import * as fs from "node:fs";
import * as path from "node:path";

describe("validateTaskStructure", () => {
  it("should return false if directories are missing", () => {
    const tmpDir = "tmp/invalid-session";
    fs.mkdirSync(tmpDir, { recursive: true });
    expect(validateTaskStructure(tmpDir)).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test installer/src/__tests__/validator.test.ts`
Expected: FAIL (module not found or function not defined)

**Step 3: Implement validation logic**

Create `installer/src/validator.ts`:
```typescript
import * as fs from "node:fs";
import * as path from "node:path";

export function validateTaskStructure(baseDir: string): boolean {
  const subdirs = ["pending", "current", "done"];
  for (const dir of subdirs) {
    if (!fs.existsSync(path.join(baseDir, "tasks", dir))) return false;
  }
  const currentDir = path.join(baseDir, "tasks", "current");
  const files = fs.readdirSync(currentDir);
  return files.length === 1;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test installer/src/__tests__/validator.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add installer/src/validator.ts installer/src/__tests__/validator.test.ts
git commit -m "feat: add validation logic for task structure"
```

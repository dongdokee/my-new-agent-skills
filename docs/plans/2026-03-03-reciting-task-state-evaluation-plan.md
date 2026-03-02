# Reciting Task State Implementation Plan

**Goal:** Transition `reciting-task-state` skill from a monolithic `todo.md` to a directory-based state machine (`tasks/pending/`, `tasks/current/`, `tasks/done/`).

**Architecture:** Instead of a single monolithic file that the agent rewrites every turn, tasks are now individual files in a directory-based state machine. Atomic `mv` operations ensure state transitions are reliable and cannot mangle other tasks. This approach reduces token usage by only reading the active task's file and prevents context drift in long sessions.

**Tech Stack:** Markdown (Skill), Shell (Commands), Node.js (Validation).

---

### Task 1: Initialize Compliance Verification Script

**Files:**
- Create: `skills/reciting-task-state/tests/compliance_check.js`
- Modify: `skills/reciting-task-state/skill.yaml:3-4`

**Step 1: Write the failing test**

```javascript
const fs = require('node:fs');
const path = require('node:path');

const tmpDir = process.env.TEST_TMP_DIR || '/tmp/gemini-reciting-task-state-test';
const sessionUuid = 'test-session';
const stateDir = path.join(tmpDir, sessionUuid);
const tasksDir = path.join(stateDir, 'tasks');

function check() {
  console.log("Checking compliance for directory-based state machine...");
  const dirs = ['pending', 'current', 'done'];
  for (const d of dirs) {
    const p = path.join(tasksDir, d);
    if (!fs.existsSync(p)) throw new Error(`Missing directory: ${p}`);
  }
  const currentFiles = fs.readdirSync(path.join(tasksDir, 'current'));
  if (currentFiles.length > 1) {
    throw new Error(`Expected at most 1 file in tasks/current/, found ${currentFiles.length}`);
  }
  console.log("PASS: Directory structure is compliant.");
}

try {
  check();
} catch (e) {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
}
```

**Step 2: Run test to verify it fails**

Run: `node skills/reciting-task-state/tests/compliance_check.js`
Expected: FAIL with "Missing directory: /tmp/gemini-reciting-task-state-test/test-session/tasks/pending"

**Step 3: Write minimal implementation (Update skill.yaml)**

```yaml
platforms: [gemini]
install_as: command
include:
  - SKILL.md
  - tests/compliance_check.js
```

**Step 4: Run test to verify it passes**

Run: `mkdir -p /tmp/gemini-reciting-task-state-test/test-session/tasks/{pending,current,done} && node skills/reciting-task-state/tests/compliance_check.js`
Expected: PASS

**Step 5: Commit**

```bash
git add skills/reciting-task-state/skill.yaml
git commit -m "test(reciting-task-state): add compliance check script"
```

---

### Task 2: Redesign SKILL.md Core Instructions

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Write the failing test**

(The compliance script from Task 1 already serves as the target state. The "failure" is that an agent following the current `SKILL.md` would not create this structure.)

**Step 2: Run test to verify it fails**

Run: `node skills/reciting-task-state/tests/compliance_check.js`
(Ensure directories are removed first)
Expected: FAIL

**Step 3: Write minimal implementation (Update SKILL.md Content)**

Rewrite `SKILL.md` to replace the monolithic `todo.md` approach with:
- Directory structure: `tasks/pending/`, `tasks/current/`, `tasks/done/`.
- New "Process" section:
  1. **Setup**: `mkdir -p tasks/{pending,current,done}`.
  2. **Every active turn**: `ls tasks/current/` and `read_file` the active task.
  3. **Transitions**: `mv tasks/current/X tasks/done/` and `mv tasks/pending/Y tasks/current/`.
- Update "Safety / Guardrails" and "Anti-Patterns" to reflect directory-based rules.
- Replace example markdown with a directory tree representation.

**Step 4: Run test to verify it passes**

(Manually perform the setup and transition steps as described in the new `SKILL.md`, then run the compliance script.)
Expected: PASS

**Step 5: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "feat(reciting-task-state): transition to directory-based state machine"
```

---

### Task 3: Refine Transition Logic and Atomic Operations

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`
- Modify: `skills/reciting-task-state/tests/compliance_check.js`

**Step 1: Write the failing test (Add transition test)**

```javascript
// Add to compliance_check.js
function testTransition() {
  console.log("Testing atomic transition...");
  const pendingFile = path.join(tasksDir, 'pending', '02-task.md');
  const currentFile = path.join(tasksDir, 'current', '02-task.md');
  fs.writeFileSync(pendingFile, 'task content');
  
  // Simulation of agent action: mv tasks/pending/02-task.md tasks/current/
  fs.renameSync(pendingFile, currentFile);

  if (fs.existsSync(pendingFile)) throw new Error("File still in pending after move");
  if (!fs.existsSync(currentFile)) throw new Error("File not in current after move");
  console.log("PASS: Atomic transition successful.");
}
```

**Step 2: Run test to verify it fails**

(The test will fail if `fs.renameSync` is not used or if the directories are not set up correctly.)

**Step 3: Write minimal implementation (Refine SKILL.md commands)**

Ensure `SKILL.md` explicitly lists the shell commands for transitions to minimize agent errors.
- `ls tasks/pending`
- `mv tasks/pending/XX-task.md tasks/current/`
- `mv tasks/current/XX-task.md tasks/done/`

**Step 4: Run test to verify it passes**

Expected: PASS

**Step 5: Commit**

```bash
git add skills/reciting-task-state/SKILL.md skills/reciting-task-state/tests/compliance_check.js
git commit -m "refactor(reciting-task-state): refine shell command instructions"
```

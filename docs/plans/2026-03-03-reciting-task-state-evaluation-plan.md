# Reciting Task State Implementation Plan

**REQUIRED SUB-AGENTS:** Launch `code-reviewer` agent in the review step, focusing on
- simplicity/DRY/elegance
- bugs/functional correctness
- project conventions/abstractions

**REQUIRED SUB-SKILL:** Invoke `test-driven-development` to understand TDD-driven task structure

**Ticket:** `docs/plans/2026-03-03-reciting-task-state-evaluation-ticket.md`

**Goal:** Transition `reciting-task-state` skill from a monolithic `todo.md` to a directory-based state machine.

**Architecture:** Use a directory structure (`tasks/pending/`, `tasks/current/`, `tasks/done/`) and individual task files. Atomic `mv` operations for state transitions. Token efficiency by reading only the active task file.

**Tech Stack:** Markdown (`SKILL.md`), Vitest (for installer tests).

**Branch:** `feature/reciting-task-state-eval`

---

### Task 1: Rewrite SKILL.md for Directory-Based State Machine

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Write the failing test**
(Note: Since this is a documentation-only change for the skill itself, we "test" it by verifying the content against the ticket's requirements.)

**Step 2: Run test to verify it fails**
(Skipped for documentation)

**Step 3: Write minimal implementation**

```markdown
---
name: reciting-task-state
description: Use this when your platform has no native task-tracking tool (no TaskCreate, no update_plan).
---

# Reciting Task State

## Purpose

When your platform provides no task-tracking tool, you act as the task tool by maintaining a directory-based state machine. This keeps the active task in the highest-attention part of context and prevents task drift.

## When to Use

- Use when you need to preserve cross-turn task continuity on platforms without native task APIs.
- Use when context-window effects repeatedly cause early-turn tasks to be forgotten.

## Architecture (Directory-Based State Machine)

State is stored in `<project-tmp-dir>/<session-uuid>/tasks/` with the following structure:

- `tasks/pending/`: Tasks waiting to be started.
- `tasks/current/`: Exactly one active task file.
- `tasks/done/`: Completed tasks.

## Why This Works

- **Atomic Transitions:** Moving files between directories (`mv`) is atomic and reliable.
- **Token Efficiency:** Only the single file in `tasks/current/` needs to be read regularly.
- **Resilience:** Decoupling tasks prevents a single large file from becoming corrupted or causing context bloat.

## Process

### 1. Setup

1. Create the directory structure: `mkdir -p tasks/{pending,current,done}` in the session's temporary directory.
2. Create initial task files in `tasks/pending/` (e.g., `01-setup.md`, `02-implement.md`).
3. Each task file should contain the task name and a brief description.

### 2. Turn Start

1. **List** `tasks/current/` to find the active task.
2. **Read** the content of the file in `tasks/current/`.

### 3. Task Transitions

- **Starting a task:** Move a file from `tasks/pending/` to `tasks/current/`.
- **Completing a task:** Move the file from `tasks/current/` to `tasks/done/`.
- **Constraint:** There MUST be exactly zero or one file in `tasks/current/` at any time.

### 4. Skill Handoff

- Ensure all relevant tasks are moved to `tasks/done/` before completing the skill's primary objective.

## File Location (Gemini CLI only)

Base path: `<project-tmp-dir>/<session-uuid>/tasks/`

- Never write tasks inside the project repository.
- Use atomic `mv` for state transitions.

## Safety / Guardrails

- Never have more than one file in `tasks/current/`.
- Always read the current task file at the start of a turn if a task is active.
- Use separate tool calls for listing directories and reading files.
```

**Step 4: Run test to verify it passes**
(Verify manually that the content matches the ticket's requirements)

**Step 5: Review, refactor, and verify**
1. **Review**: Launch `code-reviewer` agent to check the clarity and correctness of the new `SKILL.md`.
2. **Refactor**: Apply any suggested improvements.
3. **Verify**: Ensure the final `SKILL.md` is complete.

**Step 6: Commit**

```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "docs: transition reciting-task-state to directory-based state machine"
```

---

### Task 2: Add Installer Test for reciting-task-state

**Files:**
- Modify: `installer/src/__tests__/pipeline.test.ts`

**Step 1: Write the failing test**

```typescript
  it("installs reciting-task-state skill correctly", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const reciting = skills.find((s) => s.name === "reciting-task-state");
    expect(reciting).toBeDefined();
    if (!reciting) return;

    const results = installSkill(reciting, "gemini", TEST_ROOT);
    expect(results[0].outputPath).toContain(".gemini/skills/reciting-task-state/SKILL.md");
    expect(existsSync(results[0].outputPath)).toBe(true);
    
    const content = readFileSync(results[0].outputPath, "utf-8");
    expect(content).toContain("tasks/current/");
    expect(content).toContain("tasks/pending/");
    expect(content).toContain("tasks/done/");
  });
```

**Step 2: Run test to verify it fails**

Run: `npm test installer/src/__tests__/pipeline.test.ts`
Expected: FAIL (because the skill name changed or content doesn't match yet if Task 1 isn't done)

**Step 3: Write minimal implementation**
(This is already handled by Task 1 and existing installer code, but we ensure the test passes).

**Step 4: Run test to verify it passes**

Run: `npm test installer/src/__tests__/pipeline.test.ts`
Expected: PASS

**Step 5: Review, refactor, and verify**
1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: None needed if tests pass.
3. **Verify**: All tests pass.

**Step 6: Commit**

```bash
git add installer/src/__tests__/pipeline.test.ts
git commit -m "test: add installer test for reciting-task-state"
```

---

### Task 3: Add Validation Logic to Installer

**Files:**
- Modify: `installer/src/installer.ts`

**Step 1: Write the failing test**

In `installer/src/__tests__/pipeline.test.ts`:
```typescript
  it("throws error if reciting-task-state is missing directory-based architecture", () => {
     // This test will fail once we add the validation logic to installer.ts
  });
```

**Step 2: Run test to verify it fails**

**Step 3: Write minimal implementation**

In `installer/src/installer.ts`:
```typescript
export function installSkill(skill: DiscoveredSkill, platformId: string, projectRoot: string): InstallResult[] {
  // ... existing code ...
  
  // Phase 3: Validation logic
  if (skill.name === "reciting-task-state") {
    const content = readFileSync(skill.skillFilePath, "utf-8");
    if (!content.includes("tasks/current/") || !content.includes("tasks/pending/")) {
      throw new Error(`Skill "reciting-task-state" must use directory-based state machine architecture.`);
    }
  }

  // ... rest of existing code ...
}
```

**Step 4: Run test to verify it passes**

**Step 5: Review, refactor, and verify**
1. **Review**: Launch `code-reviewer` agent.
2. **Refactor**: Ensure validation is generic enough if more skills need it.
3. **Verify**: All tests pass.

**Step 6: Commit**

```bash
git add installer/src/installer.ts
git commit -m "feat: add validation logic for reciting-task-state architecture"
```

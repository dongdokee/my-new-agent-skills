# Evaluate reciting-task-state Implementation Plan

**REQUIRED SUB-AGENTS:** Launch `code-reviewer` agent in the review step, focusing on
- simplicity/DRY/elegance
- bugs/functional correctness
- project conventions/abstractions

**REQUIRED SUB-SKILL:** Invoke `test-driven-development` to understand TDD-driven task structure

**Ticket:** `docs/plans/2026-03-03-reciting-task-state-evaluation-ticket.md`

**Goal:** Transition from a monolithic `todo.md` to a directory-based state machine for robust task tracking and fix the Gemini command registration.

**Architecture:** A file-system state machine using `tasks/pending/`, `tasks/current/`, and `tasks/done/` directories. Tasks are individual files moved between directories using atomic `mv` commands.

**Tech Stack:** TypeScript (for installer validation), Markdown (for skill instructions).

---

### Task 1: Update SKILL.md with new Architecture

**Files:**
- Modify: `skills/reciting-task-state/SKILL.md`

**Step 1: Rewrite SKILL.md to use directory-based state machine**

**Content to replace/update:**
- **Purpose**: Mention directory-based tracking.
- **Format**: Individual markdown files in directories.
- **Process**: `mkdir -p tasks/{pending,current,done}`, `mv tasks/pending/X tasks/current/X`, `mv tasks/current/X tasks/done/X`.
- **Rules**: Exactly one file in `tasks/current/`.

**Step 2: Verify instructions**
Ensure the instructions are self-consistent and strictly mandate the new structure.

**Step 3: Commit**
```bash
git add skills/reciting-task-state/SKILL.md
git commit -m "feat(reciting-task-state): transition to directory-based state machine architecture"
```

---

### Task 2: Fix Gemini Command Registration

**Files:**
- Modify: `skills/reciting-task-state/skill.yaml`

**Step 1: Add missing command configuration**
Ensure it matches the `installer` requirement for Gemini commands.

```yaml
platforms: [gemini]
install_as: command
command: true
command_name: reciting-task-state
include:
  - SKILL.md
```

**Step 2: Commit**
```bash
git add skills/reciting-task-state/skill.yaml
git commit -m "fix(reciting-task-state): add command registration for Gemini CLI"
```

---

### Task 3: Implement validation logic in Installer (Phase 3)

**Files:**
- Modify: `installer/src/installer.ts`
- Create: `installer/src/__tests__/reciting-task-state-validation.test.ts`

**Step 1: Write failing test for skill validation**

```typescript
import { installSkill } from '../installer';
import { DiscoveredSkill } from '../scanner';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';

describe('reciting-task-state validation', () => {
  it('should throw error if reciting-task-state/SKILL.md lacks directory markers', () => {
    const skill: DiscoveredSkill = {
      name: 'reciting-task-state',
      dir: '/tmp/skill',
      skillFilePath: '/tmp/skill/SKILL.md',
      description: 'Test skill',
      manifest: { platforms: ['gemini'], include: ['SKILL.md'], install_as: 'command' }
    };
    // Invalid content (monolithic style)
    vi.mocked(readFileSync).mockReturnValue('todo.md: - [ ] Task');

    expect(() => installSkill(skill, 'gemini', '/tmp/out')).toThrow(/must use directory-based structure/);
  });
});
```

**Step 2: Run test to verify it fails**
Run: `cd installer && npx vitest run src/__tests__/reciting-task-state-validation.test.ts`
Expected: FAIL

**Step 3: Implement validation logic in `installSkill`**

Add check for skill name and content.

```typescript
// inside installSkill
if (skill.name === 'reciting-task-state' && !body.includes('tasks/pending')) {
  throw new Error(`Skill "reciting-task-state" must use directory-based structure (tasks/pending not found in SKILL.md)`);
}
```

**Step 4: Run test to verify it passes**
Run: `cd installer && npx vitest run src/__tests__/reciting-task-state-validation.test.ts`
Expected: PASS

**Step 5: Review, refactor, and verify**
1. Review: Launch `code-reviewer` agent.
2. Refactor: Ensure the validation is robust.
3. Verify: `npm test`.

**Step 6: Commit**
```bash
git add installer/src/installer.ts installer/src/__tests__/reciting-task-state-validation.test.ts
git commit -m "feat(installer): add validation for reciting-task-state architecture"
```

---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**REQUIRED:** Invoke `test-driven-development` skill to organize plan by Test Driven Development (TDD)

**Read FIRST:** `docs/plans/YYYY-MM-DD-<topic>-ticket.md`

**Save plans to:** `docs/plans/YYYY-MM-DD-<topic>-plan.md`

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - `RED` step
- " Run it to make sure it fails" - `Verify RED` step
- "Implement the minimal code to make the test pass" - `GREEN` step
- "Run the tests and make sure they pass" - `Verify GREEN` step
- "Review, refactor, and verify" - `Refactor` step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Topic] Implementation Plan

**REQUIRED SUB-AGENTS:** Launch `code-reviewer` agent in the review step, focusing on
- simplicity/DRY/elegance
- bugs/functional correctness
- project conventions/abstractions

**Ticket:** `<ticket-file-path>

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

**Step 5: Review, refactor, and verify**

STRICTLY follow `Review` - `Refactor` - `Verify` cycle.

1. **Review**: Launch `code-reviewer` agent to review code
2. **Refactor**: Modify codes based on the review comments from `code-reviewer` agent
3. **Verify**
   - Run: `pytest tests/path/test.py::test_name -v`
   - Expected: PASS

**Step 6: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- Reference relevant skills with @ syntax
- DRY, YAGNI, TDD, frequent commits

## Execution Handoff

After saving the plan, offer execution choice{{tool.ask_user}}:

**"Plan complete and saved to `docs/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use subagent-driven-development
- Stay in this session
- Fresh subagent per task + code review

**If Parallel Session chosen:**
- Guide them to open new session in worktree
- **REQUIRED SUB-SKILL:** New session uses executing-plans

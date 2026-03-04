---
name: finishing-ticket-implementation
description: >-
  Finalize one `Implemented` ticket by validating completion evidence,
  merging `feat/<topic>-tN` into `feat/<topic>-integration`,
  running post-merge verification, and closing status to
  `Integrated` then `Closed` on success. Use only after ticket
  implementation is complete; do not use for wave opening or
  ticket-structure changes.
---

# Finishing Ticket Implementation

Close a single implemented ticket safely.

This skill is the **wave exit gate at ticket granularity**.

## Core Principles

- Trigger only after ticket status is `Implemented`.
- Verify completion evidence before merge.
- Merge ticket branches into integration branch sequentially.
- Never close a ticket if post-merge verification fails.
- Keep status transitions explicit in the ticket artifact.

## Input / Output Contract

- Input:
  - `docs/tickets/YYYY-MM-DD-<topic>-ticket.md`
  - ticket ID (`<topic>/N`)
  - ticket branch (`feat/<topic>-tN`)
  - integration branch (`feat/<topic>-integration`)
  - verification evidence (tests/checks)
- Output:
  - updated ticket artifact with status transition
  - merge result summary and remaining blockers (if any)

## Allowed Status Transitions

- `Implemented -> Integrated -> Closed` (success path)
- `Implemented -> Implemented` (failure path; keep open with blocker notes)

This skill must not set `Ready` or `In-Progress`.

## Safety Guardrails

- Never use `git reset --hard` for rollback.
- Never force-push as part of this skill.
- Always resolve failure by explicit `merge --abort` or `revert` flow.

## Process

Use {{tool.task_tracking}} for each step.

### Step 0: Preflight Safety

1. Confirm working tree is clean before any checkout/merge:

```bash
git status --porcelain
```

2. If output is non-empty, stop and report preflight failure.
3. Verify integration branch exists:

```bash
git rev-parse --verify feat/<topic>-integration
```

4. Verify ticket branch exists:

```bash
git rev-parse --verify feat/<topic>-tN
```

5. If any branch verification fails, stop and report mismatch.
6. Do not auto-stash as part of this skill.

### Step 1: Validate Trigger Conditions

1. Confirm target ticket exists in artifact.
2. Confirm ticket status is `Implemented`.
3. Confirm branch naming matches ticket ID convention.
4. If any check fails, stop and report mismatch.

### Step 2: Verify Completion Evidence

1. Ensure acceptance criteria evidence is present.
2. Ensure validation method evidence is present and reproducible.
3. If evidence is missing/inconclusive, keep `Implemented` and return blockers.

### Step 3: Prepare Integration Merge

1. Checkout integration branch:

```bash
git checkout feat/<topic>-integration
```

2. Merge ticket branch with deterministic command:

```bash
git merge --no-ff --no-edit feat/<topic>-tN
```

3. If merge reports conflicts, abort merge and stop:

```bash
git merge --abort
```

4. Keep ticket status `Implemented` and record conflict blocker.

### Step 4: Post-Merge Verification

1. Run required regression/targeted tests for affected scope.
2. If tests fail:
   - verify `HEAD` is the merge commit for this ticket
   - revert merge commit deterministically:

```bash
git revert --no-edit -m 1 HEAD
```

   - keep ticket status `Implemented`
   - record failure blockers
   - if revert fails, stop immediately and report manual recovery steps
3. If tests pass:
   - set status `Integrated`

### Step 5: Close Ticket

1. Confirm no unresolved blocking item remains for this ticket.
2. Set status `Closed`.
3. Append completion log entry with:
   - date/time
   - merged branch
   - verification command summary

### Step 6: Report Next Action

1. If current wave still has `Implemented` tickets, repeat this skill per ticket.
2. If all tickets are `Closed`, hand off to `finishing-a-development-branch`.

## Failure Handling

- Missing evidence: do not merge; keep `Implemented`.
- Merge conflict unresolved: run `git merge --abort`; keep `Implemented`.
- Post-merge test failure: run `git revert --no-edit -m 1 HEAD`; keep
  `Implemented`.
- Artifact update failure: stop and report before any further transition.

## Anti-Patterns

- Closing ticket directly from `Implemented` to `Closed` without integration.
- Running merge before evidence validation.
- Parallel merges into integration branch without sequence control.
- Marking ticket closed when blockers/tests fail.

## Checklist Before Finishing

- [ ] Trigger condition validated (`Implemented` state).
- [ ] AC and validation evidence checked.
- [ ] Merge to integration branch completed safely.
- [ ] Post-merge verification passed.
- [ ] Status updated to `Integrated` then `Closed` (or kept `Implemented`).
- [ ] Completion log appended.

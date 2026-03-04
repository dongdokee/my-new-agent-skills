# Finishing Ticket Implementation Skill Test Prompts

Use these prompts to validate `finishing-ticket-implementation` for per-ticket
integration and closure.

## Evaluation Criteria

Each test should verify:

- Trigger condition requires ticket status `Implemented`.
- AC/Validation evidence is checked before merge.
- Merge target is `feat/<topic>-integration`.
- Success path status transitions:
  `Implemented -> Integrated -> Closed`.
- Merge conflicts use deterministic abort (`git merge --abort`).
- Post-merge test failures use deterministic rollback (`git revert --no-edit -m 1 HEAD`).
- Failure path keeps status at `Implemented` with blocker notes.

## Prompt 1

Ticket artifact `search-performance`:
- `search-performance/2` status is `Implemented`.
- Branch `feat/search-performance-t2` exists.
- Integration branch `feat/search-performance-integration` exists.
- Validation evidence for AC1/AC2/AC3 is attached and reproducible.

Finish ticket `search-performance/2`.

### Expected Outcome

- Merge into integration branch succeeds.
- Post-merge verification passes.
- Status moves to `Integrated` then `Closed`.

## Prompt 2

Ticket artifact `onboarding-unification`:
- `onboarding-unification/3` status is `Implemented`.
- Branch merge causes conflicts in routing middleware.

Finish ticket `onboarding-unification/3`.

### Expected Outcome

- Ticket remains `Implemented`.
- `git merge --abort` path is used.
- Conflict summary is reported.
- No close transition occurs.

## Prompt 3

Ticket artifact `placeholder-governance`:
- `placeholder-governance/5` status is `Implemented`.
- Merge succeeds.
- Post-merge tests fail on unresolved placeholder regression.

Finish ticket `placeholder-governance/5`.

### Expected Outcome

- Ticket remains `Implemented`.
- `git revert --no-edit -m 1 HEAD` rollback is used.
- Failure blockers recorded for follow-up.
- No `Closed` status.

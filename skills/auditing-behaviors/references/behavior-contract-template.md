# Behavior Contract Template

Use this template for `docs/behavior-contract.md`.

```markdown
# Behavior Contract

## Scope

- Repository root:
- Audit mode: `bootstrap | delta-audit`
- Included sources:
- Excluded sources:

## Audit Summary

- New: 0
- Changed: 0
- Removed: 0
- Missing: 0

## User Stories

| Story ID | Story | Entry Points | Evidence | Status |
| --- | --- | --- | --- | --- |
| US-1 | ... | ... | ... | Verified |

## Acceptance Criteria

| Story ID | AC ID | AC | Acceptance test | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| US-1 | AC-1.1 | ... | path/to/test | ... | Verified |

## User Journeys

| Journey ID | Steps | Trigger | End Condition | E2E test | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| UJ-1 | ... | ... | ... | path/to/e2e | ... | Verified |

## Gap Backlog

| Type | Related ID | Gap | Needed Evidence | Priority | Owner |
| --- | --- | --- | --- | --- | --- |
| Acceptance test missing | AC-1.2 | No acceptance test | Add integration or E2E test | High | TBD |

## Change Log

| Timestamp (UTC) | Mode | Reason | Impact Scope |
| --- | --- | --- | --- |
| 2026-03-04T00:00:00Z | bootstrap | Initial baseline | Full repository scan |
```

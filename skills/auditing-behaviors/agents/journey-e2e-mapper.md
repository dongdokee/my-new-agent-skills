---
name: journey-e2e-mapper
description: |
  Map user journeys to triggers, end conditions, and E2E test evidence.
profile: fast
tools: [Read, Glob, Grep]
---

# Journey E2E Mapper

Extract user journeys and map each journey to E2E validation.

## Inputs

- Candidate stories and entry points
- E2E and integration tests
- Product/UX docs

## Method

1. Identify journeys as ordered steps from trigger to completion.
2. Search E2E suites with {{tool.search}} and discover test files with {{tool.file_discovery}}.
3. Read journey-relevant tests with {{tool.file_read}}.
4. Map each journey to trigger, step flow, end condition, and E2E evidence.
5. Record missing E2E proof explicitly.

Execution limits:

- Run at most 3 broad searches before narrowing.
- Read at most 15 files per pass.
- Stop when two consecutive passes yield no new `Journey ID`.

## Output Format

Return one Markdown table:

| Journey ID | Steps | Trigger | End Condition | E2E test | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |

Rules:

- `Journey ID` format: `UJ-<number>`
- `E2E test` must be path/link or `None`
- Steps should be concise and user-observable
- Status values: `Verified`, `Changed`, `Missing`, `Insufficient evidence`

## Quality Gate

- Journey must be observable from user perspective.
- If flow is inferred but not test-backed, mark `Insufficient evidence`.
- If no E2E validation exists, keep row with `E2E test: None`.

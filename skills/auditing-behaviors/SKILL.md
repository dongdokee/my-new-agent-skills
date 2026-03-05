---
name: auditing-behaviors
description: >-
  Use when users ask to audit User Stories, Acceptance Criteria, User Journeys,
  or behavior-contract drift against code/tests, and maintain one SSOT file at
  docs/behavior-contract.md with explicit evidence and gap tracking.
---

# Auditing Behaviors

Audit the codebase against user-facing behavior expectations and keep one SSOT
document updated at `docs/behavior-contract.md`.

## Purpose

Build and maintain one behavior contract from repository evidence:

- User Stories + boundary entry points (inbound and outbound)
- Acceptance Criteria + acceptance test mapping
- User Journeys + E2E test mapping

Treat repository layout as an implementation detail: first identify one
integrated behavior system (all modules/packages/components that participate in
the same user-facing flow), then audit behavior using that system's boundaries.

This skill has two run modes:

- `bootstrap`: initial full scan and first contract creation
- `delta-audit`: focused re-audit for changes since last contract update

## The Iron Laws

1. Do not claim a story, criterion, or journey without evidence.
2. Missing evidence must be recorded explicitly as `None` or `Insufficient evidence`.
3. Keep exactly one SSOT contract file under `docs/`: `docs/behavior-contract.md`.

## Boundary Terms

- Inbound boundary entry points: routes, UI handlers, CLI commands, API
  endpoints, webhook/event triggers
- Outbound boundary entry points: database/persistence operations, external API
  clients, queue/event publish-consume paths, storage adapters, third-party
  integrations
- Story `Entry Points` value format: `IN: <inbound-list> || OUT:
  <outbound-list>`
  - Use `None` for a missing side (example: `IN: route:/health || OUT: None`)

## When to Use

- User asks to audit behavior coverage against codebase reality.
- You need a traceable contract between implementation, tests, and user intent.
- You need to detect drift between code and behavior documentation.
- User request phrases include:
  - `user story audit`, `acceptance criteria audit`, `user journey audit`
  - `behavior contract`, `behavior drift`, `contract vs code`
  - `스토리 감사`, `AC 감사`, `저니 감사`, `행동 계약 점검`

## When Not to Use

- User requested direct feature implementation.
- Repository has no discoverable behavior evidence and user asked for speculative design only.

## Input / Output Contract

- Input: repository files (docs, code, tests), optional existing `docs/behavior-contract.md`
- Output: updated `docs/behavior-contract.md` with:
  - `Scope`
  - `Audit Summary`
  - `User Stories`
  - `Acceptance Criteria`
  - `User Journeys`
  - `Gap Backlog`
  - `Change Log`

## Process

**REQUIRED:** Track work using {{tool.task_tracking}}.

### Step 1: Select mode

Select one mode before scanning:

- `bootstrap`: no prior contract, or contract is stale/invalid
- `delta-audit`: contract exists and you only need re-validation for changed behavior

Before scanning, define audit scope with repository-layout-agnostic rules:

1. Identify all modules/packages/components participating in each user-facing flow.
2. Treat those parts as one integrated behavior system for auditing.
3. Build a boundary map using the `Boundary Terms` above.

For `delta-audit`, determine scope with deterministic rules:

1. Determine a base revision:
   - Use user-provided base revision when present.
   - Else use `HEAD~1` as default.
2. Build changed file set from `git diff --name-only <base>...HEAD`.
3. Classify impacted files into:
   - behavior docs (`README`, `docs/**`)
   - boundary entry points (inbound/outbound)
   - tests (`e2e/**`, integration tests, acceptance-like suites)
4. Re-audit only impacted stories/AC/journeys plus directly linked rows.
5. Fallback to `bootstrap` if:
   - base revision cannot be resolved, or
   - changed file set is too broad to trust selective mapping.

### Step 2: Collect evidence in strict order

1. Read behavior intent sources first using {{tool.file_discovery}}, {{tool.search}}, {{tool.file_read}}:
   - `README`
   - `docs/` product/spec/guide/ADR/release notes
   - issue/PR descriptions if present in repository
2. Read tests second:
   - prioritize E2E/integration tests for acceptance evidence
   - if missing, record `Acceptance test: None` or `E2E test: None`
3. Trace boundary entry points third:
   - identify inbound and outbound boundary entry points using `Boundary Terms`
   - follow inbound trigger -> state change -> domain/service -> outbound effects

### Step 3: Dispatch subagents in parallel

Launch required subagents in parallel with a strict concurrency cap:

- At most 3 subagents may run at the same time.
- If additional passes are needed, run them in later waves after an active subagent completes.

Required subagents:

- `story-extractor`: extract stories + boundary entry points + evidence
- `ac-test-mapper`: map acceptance criteria to acceptance/integration tests
- `journey-e2e-mapper`: map journeys to E2E tests and completion conditions

Subagent outputs must include evidence paths and line hints when available.
Each subagent must stay within token budget:

- Start with at most 3 broad searches, then narrow.
- Read at most 15 files before first report.
- Stop scanning when two consecutive batches add no new IDs.

### Step 4: Merge and normalize

Merge all findings using these rules:

1. Deduplicate semantically equivalent items.
2. Preserve all valid evidence references.
3. Mark low-confidence claims as `Insufficient evidence`.
4. For missing mappings, render explicit `None` fields.

Status values:

- `Verified`
- `Changed`
- `Missing`
- `Insufficient evidence`

### Step 5: Update `docs/behavior-contract.md`

Render all sections in English only.

Minimum row requirements:

- Every story row must include `Entry Points` in format `IN: <...> || OUT: <...>`, or `None` when no boundary evidence exists.
- Every AC row must include `Acceptance test` link or `None`.
- Every journey row must include `E2E test` link or `None`.
- Every unresolved or missing item must be listed in `Gap Backlog`.

For `delta-audit`:

- re-check only changed or impacted areas first
- keep unchanged verified rows unless evidence invalidates them
- update `Audit Summary` counts: `new`, `changed`, `removed`, `missing`
- never rewrite unaffected rows unless their evidence path was touched

### Step 6: Log the audit

Append one `Change Log` entry with:

- audit timestamp
- mode (`bootstrap` or `delta-audit`)
- reason for update
- impact scope

## Merge Rule Details

- Story ID format: `US-<number>`
- AC ID format: `AC-<story-number>.<number>`
- Journey ID format: `UJ-<number>`
- If two rows conflict and neither can be disproven quickly, keep one merged row and set status to `Insufficient evidence`, then add a matching item in `Gap Backlog`.

## Token Efficiency Rules

- Do not paste long excerpts from files; summarize and cite evidence paths.
- Prefer targeted reads over full-file reads after initial discovery.
- Reuse subagent outputs as input to avoid repeated scans.
- In `delta-audit`, forbid repository-wide rescans unless fallback criteria are met.

## Checklist Before Finishing

- [ ] Used docs as the first evidence source
- [ ] Used tests as primary AC/Journey evidence source
- [ ] Traced inbound and outbound boundary entry points through call chains
- [ ] Ran required subagents in parallel within cap (`<=3`)
- [ ] Story rows used `Entry Points` format (`IN: <...> || OUT: <...>`) or `None`
- [ ] Updated only `docs/behavior-contract.md` as behavior SSOT
- [ ] Explicitly wrote `None` for missing test/entry-point/boundary links
- [ ] Added all uncertain items to `Gap Backlog`
- [ ] Added a `Change Log` entry

---
name: ticket-revalidation
description: >-
  Promote only next-frontier `Provisional` tickets to `Ready` at wave
  boundaries after direct dependencies are `Integrated` or `Closed`.
  Ask questions only for unresolved `Blocking` unknowns or
  execution-critical drift. Do not use before a ticket artifact exists,
  for ticket closure, or for structural rewrites of Objective/Type/Dependency
  (route to `ticketing`).
---

# Ticket Revalidation

Promote `Provisional` tickets to `Ready` at wave boundaries.

This skill is the **wave entry gate**. It does not implement code and it does
not close tickets.

## Core Principles

- Read the existing ticket artifact first.
- Revalidate only tickets in the next dependency frontier.
- Ask questions{{tool.ask_user}} only for blocking unknowns or spec drift.
- Keep status transitions explicit in the ticket artifact.
- If dependency/type/objective changes materially, return to `ticketing`.

## Input / Output Contract

- Input:
  - `docs/tickets/YYYY-MM-DD-<topic>-ticket.md`
  - Evidence from completed predecessor tickets (branch, commits, test results)
- Output:
  - Updated ticket artifact with `Ready` status for selected wave tickets
  - Ready wave brief (ticket IDs, branch names, worktree names, entry checks)

## Allowed Status Transitions

- `Provisional -> Ready` (primary)
- `Ready -> Provisional` (only when new drift invalidates readiness)

This skill must not set `In-Progress`, `Implemented`, `Integrated`, or
`Closed`.

## Process

Use {{tool.task_tracking}} for each step.

### Step 1: Load and Validate Artifact

1. Read ticket artifact and parse:
   - ticket IDs, dependencies, current statuses
   - wave index
   - open questions and revalidation history
2. Verify graph is acyclic and IDs are valid.
3. If artifact is inconsistent, stop and request repair.

### Step 2: Determine Next Frontier

1. Find tickets in `Provisional` where all direct dependencies are in
   `Integrated` or `Closed`.
2. This set is the candidate next wave.
3. If no candidates exist:
   - report no-ready-wave state
   - exit without changes

### Step 3: Analyze Drift and Unknowns

For each candidate ticket:

1. Compare predecessor implementation evidence vs provisional spec.
2. Detect drift in:
   - objective assumptions
   - API/schema/contracts
   - in-scope file targets
   - acceptance criteria and validation methods
3. Review open questions:
   - if `Blocking` remains, interview is required
   - if only `Non-blocking`, continue without interview

### Step 4: Interview Only When Required

Ask one focused question at a time{{tool.ask_user}} only if:

- unresolved `Blocking` question exists, or
- drift makes current spec ambiguous for execution.

If no blocking unknowns and no execution-critical drift, do not ask questions.

### Step 5: Run Ready Gate Per Ticket

A candidate becomes `Ready` only if all pass:

1. Objective is specific/testable/single-intent.
2. In-Scope is concrete enough for implementation handoff.
3. Acceptance Criteria are binary/observable.
4. Validation Method maps 1:1 with Acceptance Criteria.
5. No unresolved `Blocking` question remains.

If a ticket fails gate, keep `Provisional` and record why.

### Step 6: Update Artifact and Emit Wave Brief

1. For each passing ticket:
   - set status to `Ready`
   - append revalidation history entry
2. Keep failing tickets as `Provisional` with explicit blockers.
3. Present ready wave brief including naming conventions:
   - integration branch: `feat/<topic>-integration`
   - ticket branch: `feat/<topic>-tN`
   - worktree: `.worktrees/<topic>-tN`

### Step 7: Escalate Structural Changes

If revalidation requires changing ticket `Objective`, `Type`, or `Dependency`,
stop ready promotion for affected tickets and route back to `ticketing`.

## Anti-Patterns

- Revalidating all tickets instead of only frontier candidates.
- Asking broad interviews when no blocker exists.
- Promoting tickets to `Ready` with unresolved blockers.
- Quietly changing objective/type/dependency without `ticketing`.
- Setting implementation/closure statuses in this skill.

## Checklist Before Finishing

- [ ] Next frontier computed from dependency + status data.
- [ ] Interviews asked only for blockers or drift.
- [ ] Ready gate passed for each promoted ticket.
- [ ] Non-promoted tickets include explicit blocker notes.
- [ ] Revalidation history appended.
- [ ] Ready wave brief emitted.

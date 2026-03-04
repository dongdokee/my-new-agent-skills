---
name: ticketing
description: >-
  Decompose ambiguous, conflated, or multi-step requests into
  dependency-ordered `Provisional` tickets and obtain initial set approval
  only. Use for requests like "break this down into tickets" or
  "plan implementation tasks". Do not use when work is already
  implementation-ready or when immediate coding is explicitly requested.
---

# Ticketing

Convert ambiguous requests into an approved **initial ticket set**.

This skill ends at **initial set approval**. It does not promote tickets to
`Ready` and it does not run implementation.

## Core Principles

- Ask one question at a time{{tool.ask_user}}.
- Keep every ticket single-intent and single-type.
- Track every phase via {{tool.task_tracking}}.
- Keep unresolved uncertainty explicit as open questions.

## Input / Output Contract

- Input: ambiguous request requiring decomposition and requirement shaping.
- Output file: `docs/tickets/YYYY-MM-DD-<topic>-ticket.md`
- Topic token: kebab-case (`<topic>`)
- Ticket IDs: `<topic>/1`, `<topic>/2`, ...
- Initial status for every ticket: `Provisional`
- Each ticket has `Spec Detail Level`: `Full` or `Lean`

## Ticket Type

Assign exactly one type per ticket.

| Type | Assign When |
|------|-------------|
| `Feature` | New capability or functional behavior change |
| `Refactoring` | Internal restructuring with no observable behavior change |
| `Documentation` | Human-facing documentation updates |
| `Test` | New or expanded test coverage |
| `Bug` | Fixing behavior that deviates from expected behavior |
| `Improvement` | Non-functional enhancement (performance, UX, maintainability) |

If intent spans multiple types, split by type.

## Process

Use {{tool.task_tracking}} for phase/step updates.

### Phase 1: Decompose into Incomplete Tickets

**Goal:** produce the smallest dependency-ordered ticket set.

1. Derive topic token (`2-3` words, kebab-case).
2. Identify intents and assign one type per ticket.
3. Establish direct dependencies only.
4. Topologically sort and assign IDs.
5. Apply splitting criteria.
6. Present list for confirmation{{tool.ask_user}}:
   - topic token
   - each ticket (`ID`, `type`, `goal`, `depends-on`)
   - Mermaid dependency graph (skip graph when single-ticket case)

#### Splitting Criteria

A ticket is valid only if all three hold:

- **Single Intent**: one type, one goal.
- **Immediately Verifiable**: completion can be validated.
- **Failure Cause Identifiable**: failure source is traceable to this ticket.

If any criterion fails, split or merge.

### Phase 2: Identify Missing Tickets

**Goal:** capture implied but missing work.

1. Compare current ticket set vs request and repo context.
2. Draft candidate missing tickets.
3. Present candidates{{tool.ask_user}} and request add/no-add decision.
4. Reassign IDs by dependency order and re-run splitting criteria.

### Phase 3: Draft Provisional Specs

**Goal:** capture sufficient provisional detail without over-specifying far
waves.

Detail level rules:

- Wave 1 tickets: `Full`
- Wave 2+ tickets: `Lean`

Use `Full` for execution-near tickets and `Lean` for far-future tickets.

For each ticket in dependency order:

1. Mark ticket as in-progress in {{tool.task_tracking}}.
2. Explore codebase enough to identify concrete likely in-scope targets.
3. Set `Spec Detail Level`:
   - `Full` if ticket is in Wave 1
   - `Lean` if ticket is in Wave 2+
4. Draft fields by level:
   - `Full`:
     - Objective
     - In-Scope (Provisional)
     - Out-of-Scope
     - Acceptance Criteria (Draft)
     - Validation Method (Draft)
     - Open Questions (`Blocking` / `Non-blocking`)
   - `Lean`:
     - Objective
     - depends_on summary
     - Tentative In-Scope
     - Blocking Open Questions
5. Ask focused questions{{tool.ask_user}} only when required to remove ambiguity in
   provisional fields.
6. Mark ticket status as `Provisional` and assign initial wave candidate.

Notes:

- `Blocking` open questions may remain at this stage.
- Record unknowns explicitly; do not hide uncertainty.

### Phase 4: Review and Approve Initial Set

**Goal:** approve ticket set baseline before execution workflows.

1. Run Initial Set Gate (below).
2. Present review package:
   - summary table (`ID`, `type`, `goal`, `status`, `wave`)
   - dependency graph
   - provisional spec summaries
3. Request decision{{tool.ask_user}}:
   - `Approve`: save using `references/ticket-template.md`
   - `Revise`: revise selected tickets and repeat Phase 4
   - `Stop`: end and report current status

### Initial Set Gate

Set is acceptable only when all checks pass:

1. Every ticket passes splitting criteria.
2. Dependency graph is acyclic.
3. Every ticket has required provisional fields for its detail level.
4. Open questions are classified (`Blocking` / `Non-blocking`).
5. Every ticket status is `Provisional`.

## Status Model (for downstream skills)

This skill only writes `Provisional`.

- `Provisional` -> managed here
- `Ready` -> managed by `ticket-revalidation`
- `In-Progress`, `Implemented` -> user implementation phase
- `Integrated`, `Closed` -> `finishing-ticket-implementation`

## Anti-Patterns

- Treating provisional specs as final execution specs.
- Marking tickets `Ready` inside this skill.
- Hiding unresolved unknowns instead of recording them.
- Mixing multiple ticket types into one ticket.
- Skipping codebase exploration and guessing in-scope targets.
- Asking multi-part questions in one turn.

## Checklist Before Finishing

- [ ] Initial set gate passes.
- [ ] All ticket statuses are `Provisional`.
- [ ] Dependency graph and wave index are present.
- [ ] Open questions are fully classified.
- [ ] Artifact saved to `docs/tickets/`.

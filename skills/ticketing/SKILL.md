---
name: ticketing
description: >-
  Interactive workflow that decomposes ambiguous user requests into sequential
  implementation tickets, collects planning-critical details through structured
  interview and targeted codebase exploration, and produces approved ticket and
  plan artifacts. Use when requirements are unclear and must be concretized
  before implementation.
---

# Ticketing

## Overview

Convert ambiguous requests into approved tickets and an approved implementation plan.

## Core Principles

- Write all interview prompts and artifacts in English.
- Ask one question at a time{{tool.ask_user}}.
- Keep questions decision-focused and noise-free.
- Track every phase using {{tool.task_tracking}}.
- Do not claim readiness until blocking unknowns are resolved.
- Use platform-neutral Markdown for all artifacts.
- Do not use provider-specific wrappers or tags.

## Quick Reference

1. Decompose the request into sequential tickets with one type per ticket.
2. Collect common required fields for each ticket.
3. Collect type-specific signals only when they materially help planning.
4. Resolve blocking unknowns with targeted interview and direct codebase exploration.
5. Run readiness gate and request ticket approval.
6. Save the approved ticket artifact to `docs/tickets/`.
7. Draft a decision-complete implementation plan mapped to ticket IDs.
8. Request plan approval and save the approved plan to `docs/plans/`.

## When to Use

- The request is broad, mixed, or ambiguous.
- The request must be split into multiple sequential tickets.
- Planning cannot start until scope and acceptance criteria are explicit.
- The user wants a ticket artifact plus an implementation plan.

## When Not to Use

- The request is already concrete and implementation-ready.
- The change is trivial and does not need ticket decomposition.
- The user asks for direct implementation without planning artifacts.

## Input / Output Contract

- Input: a user request that needs decomposition and requirement concretization.
- Ticket Output: `docs/tickets/YYYY-MM-DD-<topic>-ticket.md`
- Plan Output: `docs/plans/YYYY-MM-DD-<topic>-plan.md`
- Topic token rule: `<topic>` must be `snake_case` and must not contain `-`.
- Ticket IDs in a ticket file: `T01`, `T02`, `T03`, ...

## Process

**REQUIRED:** Use {{tool.task_tracking}} for each phase and step status update.

### Phase 1: Request Decomposition Interview

- Ask one question at a time{{tool.ask_user}}.
- Every question must follow this structure:
  - `Question: ...?`
  - `Type: Single-selection | Multiple-selection`
  - `Options: A-D (2-4 options)`
  - `Recommendation: ...`
  - `Reasoning: ...`
- Decompose the request into sequential tickets.
- Assign exactly one ticket type per ticket:
  - `Feature`, `Refactoring`, `Documentation`, `Test`, `Bug`, `Improvement`
- Order tickets by dependency first.
- If dependency order is tied, use this priority:
  - `Feature -> Refactoring -> Bug -> Improvement -> Documentation -> Test`

### Phase 2: Ticket Detail Collection

For each ticket, collect these required fields:

- `Objective`
- `In-Scope`
- `Out-of-Scope`
- `Acceptance Criteria`
- `Validation Method`
- `Dependencies`

Collect these fields only when needed:

- `Risks`
- `Constraints`
- `Rollback`

Collection policy:

- Use only planning-relevant questions.
- Use type-specific signal examples as guidance, not mandatory keys.
- If blocking ambiguity remains, perform targeted direct codebase exploration.
- Do not launch sub-agents in this workflow.
- Return to interview questions after exploration if ambiguity remains.

### Phase 3: Ticket Readiness Gate and Approval

A ticket set is ready only if all checks pass:

- Implementation boundaries are explicit.
- Acceptance criteria and validation methods are testable.
- Dependency order is actionable.
- No unresolved blocking open question exists.

Open question policy:

- Classify each item as `Blocking` or `Non-blocking`.
- Any remaining `Blocking` item prevents approval.

Present decision options{{tool.ask_user}}:

- `Approve`
- `Revise`
- `Stop`

Decision handling:

- `Approve`: save ticket artifact.
- `Revise`: return to Phase 1 or Phase 2 as needed.
- `Stop`: end workflow with current status summary.

### Phase 4: Plan Drafting From Approved Tickets

- Draft a decision-complete implementation plan immediately after ticket approval.
- Use platform-neutral Markdown only.
- Do not use provider-specific wrappers (for example, `<proposed_plan>`).
- Map every task package to at least one `Txx`.
- Do not include unowned tasks that cannot be traced to a ticket.

### Phase 5: Plan Approval and Finalization

Present decision options{{tool.ask_user}}:

- `Approve`
- `Revise`
- `Stop`

Decision handling:

- `Approve`: save plan artifact to `docs/plans/YYYY-MM-DD-<topic>-plan.md`.
- `Revise`: update the plan and re-run approval.
- `Stop`: end workflow with current status summary.

## Ticket Type Signal Examples

Use these as optional signal prompts when they materially improve planning quality.

- `Feature`
  - Functional intent
  - Interface or contract impact
  - Non-functional target if applicable
- `Refactoring`
  - AS-IS structure
  - TO-BE structure
  - Behavior invariants that must stay unchanged
- `Documentation`
  - Target audience
  - Source of truth
  - Deliverable format and location
- `Test`
  - Test level (unit, integration, e2e)
  - Scenario matrix
  - Test data strategy
- `Bug`
  - Reproduction steps
  - Expected vs actual behavior
  - Failure scope
- `Improvement`
  - Baseline metric
  - Target metric
  - Improvement hypothesis

## Templates

### Ticket Template

```markdown
# Ticket: <topic> (<YYYY-MM-DD>)

**Status:** Draft | Approved
**Topic:** <snake_case_topic>
**Ticket File:** docs/tickets/<YYYY-MM-DD>-<topic>-ticket.md

## 1. Request Summary
- <summary>

## 2. Decomposed Ticket Index

| ID  | Type | Title | Depends On |
| --- | ---- | ----- | ---------- |
| T01 | Feature | <title> | - |

## 3. Ticket Details

### T01 - <title>
**Type:** <Feature|Refactoring|Documentation|Test|Bug|Improvement>

**Objective**
- <...>

**In-Scope**
- <...>

**Out-of-Scope**
- <...>

**Acceptance Criteria**
- [ ] <...>

**Validation Method**
- <tests/checks/verification method>

**Dependencies**
- <Txx or external dependency>

**Optional Fields (only if needed)**
- Risks: <...>
- Constraints: <...>
- Rollback: <...>

**Type-Specific Signals Used**
- <signal 1>
- <signal 2>

## 4. Open Questions

### Blocking
- <question or "None">

### Non-blocking
- <question or "None">

## 5. Readiness Gate
- [ ] Boundaries are explicit
- [ ] Acceptance + validation are testable
- [ ] Dependency order is actionable
- [ ] No blocking open question remains

## 6. Approval Record
- Ticket Decision: <Approve|Revise|Stop>
- Notes: <...>
```

### Plan Template

```markdown
# Implementation Plan: <topic> (<YYYY-MM-DD>)

**Status:** Draft | Approved
**Source Ticket:** docs/tickets/<YYYY-MM-DD>-<topic>-ticket.md
**Plan File:** docs/plans/<YYYY-MM-DD>-<topic>-plan.md

## 1. Goal
- <one-sentence goal>

## 2. Scope
- In-Scope: <...>
- Out-of-Scope: <...>

## 3. Task Packages (Mapped to Tickets)

### Package A (T01)
- Objective: <...>
- Files to Create/Modify: <...>
- Implementation Steps:
  1. <...>
  2. <...>
- Validation:
  - <tests/checks>

### Package B (T02)
- Objective: <...>
- Files to Create/Modify: <...>
- Implementation Steps:
  1. <...>
  2. <...>
- Validation:
  - <tests/checks>

## 4. Architectural Decision Record (ADR)

### ADR-001: <decision title>
- Context: <...>
- Decision: <...>
- Alternatives Considered: <...>
- Consequences: <...>

## 5. Approval Record
- Plan Decision: <Approve|Revise|Stop>
- Notes: <...>
```

## Anti-Patterns

- Asking multi-part questions in one turn.
- Asking open-ended questions without actionable options.
- Collecting details that do not affect planning decisions.
- Mixing multiple ticket types into one ticket.
- Approving tickets with unresolved blocking questions.
- Generating plan tasks that are not mapped to `Txx`.
- Writing provider-specific output syntax into artifacts.

## Checklist Before Finishing

- [ ] Ticket IDs are sequential and dependency ordered.
- [ ] Every ticket has all required common fields.
- [ ] Optional fields appear only when justified.
- [ ] Blocking open questions are fully resolved before approval.
- [ ] Ticket artifact is approved and saved under `docs/tickets/`.
- [ ] Plan is decision-complete and every package maps to `Txx`.
- [ ] Plan includes an ADR section.
- [ ] Plan artifact is approved and saved under `docs/plans/`.
- [ ] All outputs are in English.

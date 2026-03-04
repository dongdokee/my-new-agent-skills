---
name: ticketing
description: >-
  Decompose ambiguous or mixed user requests into dependency-ordered,
  single-type tickets through one-question interviews, then draft
  approval-gated ticket artifacts. Use when requirements are unclear,
  conflated, or multi-step; skip when the request is already
  implementation-ready.
---

# Ticketing

## Overview

Convert ambiguous requests into approved tickets with quality-governed specs.

## Core Principles

- Write all interview prompts and artifacts in English.
- Ask one question at a time{{tool.ask_user}}.
- Keep questions decision-focused and noise-free.
- Track every phase using {{tool.task_tracking}}.
- Do not claim readiness until blocking unknowns are resolved.
- Use platform-neutral Markdown for all artifacts.
- Do not use provider-specific wrappers or tags.

## Quick Reference

1. Apply splitting criteria to decompose the request into single-intent tickets.
2. Assign set-based IDs and determine dependency order.
3. Author a quality-attribute-governed Spec for each ticket.
4. Collect type-specific signals when they materially improve ticket quality.
5. Resolve blocking unknowns with targeted interview and codebase exploration.
6. Run readiness gate (including spec quality) and request approval.
7. Save the approved ticket artifact to `docs/tickets/`.

## When to Use

- The request is broad, mixed, or ambiguous.
- The request must be split into multiple sequential tickets.
- Scope and acceptance criteria must be explicit before implementation.
- The user wants a ticket artifact before implementation.

## When Not to Use

- The request is already concrete and implementation-ready.
- The change is trivial and does not need ticket decomposition.
- The user asks for direct implementation without ticket artifacts.

## Input / Output Contract

- Input: a user request that needs decomposition and requirement concretization.
- Ticket Output: `docs/tickets/YYYY-MM-DD-<topic>-ticket.md`
- Topic token rule: `<topic>` must be `kebab-case`.
- Ticket IDs in a ticket file: `<set-name>/1`, `<set-name>/2`, `<set-name>/3`, ... where set name equals the topic token.

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

#### Splitting Criteria

A ticket can remain as a single unit only if **all three** conditions hold:

- **Single Intent** — one ticket type, one goal; describable as "this ticket does X". Equivalent to the single-intent splitting criterion.
- **Immediately Verifiable** — a validation method exists at completion time. Equivalent to the immediate-verification splitting criterion.
- **Failure Cause Identifiable** — failure is traceable within this ticket alone. Equivalent to the failure-traceability splitting criterion.

If any criterion fails, split or merge.

#### Splitting Procedure

1. Separate by ticket type if multiple types are mixed.
2. List expected acceptance conditions within each type and identify required code changes.
3. Group conditions whose code changes overlap into one ticket.
4. Verify each ticket meets all three splitting criteria.
5. Determine dependency order (a ticket that cannot be verified without a predecessor must follow it).
6. If a ticket cannot be independently verified, merge it with an adjacent ticket.

#### Ticket Types

- `Feature`, `Refactoring`, `Documentation`, `Test`, `Bug`, `Improvement`

#### Ordering Rules

- Order tickets by dependency first.
- If dependency order is tied, use this priority:
  - `Feature -> Refactoring -> Bug -> Improvement -> Documentation -> Test`

### Phase 2: Ticket Spec Authoring

For each ticket, author a Spec with the following fields. Each field must satisfy its quality attributes.

Collection policy:

- Use only ticket-readiness-relevant questions.
- Use type-specific signal examples as guidance, not mandatory keys.
- If blocking ambiguity remains, perform targeted direct codebase exploration.
- Do not launch sub-agents in this workflow.
- Return to interview questions after exploration if ambiguity remains.

**Objective** — Specific, Testable, Singular

The ticket's purpose and expected result in one sentence. Must correspond to a single ticket type.
Place `depends_on:` notation between the heading and body when dependencies exist; omit when there are none.

> Good: "Add a `ValidationError` return when required fields are missing in the config file."
> Bad: "Improve input validation."

**In-Scope** — Enumerable, Locatable, Bounded

Items to change or create, listed at path/module/function level.

> Good: "`src/auth/login.ts`: `validateToken()` function; `src/auth/types.ts`: type definitions"
> Bad: "Authentication-related files"

**Out-of-Scope** — Negative, Firm, Relevant

Items explicitly excluded. Only list items plausibly confused as in-scope.

> Good: "The existing `exportToCsv()` function is not modified."
> Bad: "Database schema is not changed." (no DB exists)

**Acceptance Criteria** — Binary, Observable, Complete

Conditions that determine ticket completion. Cover happy path and key edge cases.

> Good: "1) Valid input -> JSON output 2) Empty input -> empty object 3) Invalid field -> error"
> Bad: "JSON is generated correctly." (happy path only)

**Validation Method** — Executable, Reproducible, Mapped

Concrete verification means for each AC. Must map 1:1 to AC items.

> Good: "AC1 -> `test_valid_output` / AC2 -> `test_empty_input`"
> Bad: "Run the full test suite." (unclear which AC is verified)

**Constraints** (conditional) — Explicit, Actionable, Prioritized

Technical restrictions on implementation. Include only when meaningful constraints exist.

> Good: "No external library additions; stdlib only. Backward compat > perf optimization."
> Bad: "Minimize dependencies."

**Risks** (conditional) — Causal, Mitigatable, Scoped

Technical risks within In-Scope range. Include only when non-trivial risks are identified.

> Good: "Locale-dependent date parsing breaks CSV sort order -> enforce ISO 8601 + locale-agnostic test."
> Bad: "Date parsing might be tricky."

### Phase 3: Ticket Readiness Gate and Approval

A ticket set is ready only if all checks pass:

1. Each Objective is single-intent, verifiable, and failure-traceable.
2. Each Spec field satisfies its quality attributes.
3. Acceptance Criteria and Validation Methods are 1:1 mapped.
4. Dependency graph has no cycles.
5. No blocking open question remains.

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

## Ticket Type Signal Examples

Use these as optional signal prompts when they materially improve ticket quality.

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
**Topic:** <kebab-case-topic>
**Ticket File:** docs/tickets/<YYYY-MM-DD>-<topic>-ticket.md

## 1. Request Summary
- <summary>

## 2. Decomposed Ticket Index

| ID | Type | Title | Depends On |
| --- | ---- | ----- | ---------- |
| <set-name>/1 | Feature | <title> | - |
| <set-name>/2 | Improvement | <title> | <set-name>/1 |

## 3. Ticket Details

### <set-name>/1 - <title>
**Type:** <Feature|Refactoring|Documentation|Test|Bug|Improvement>

#### Spec

**Objective**

(depends_on: <set-name>/N) <!-- omit this line if no dependencies -->

- <single-intent, testable, singular objective>

**In-Scope**
- <enumerable, locatable, bounded items>

**Out-of-Scope**
- <negative, firm, relevant exclusions>

**Acceptance Criteria**
- [ ] AC1: <binary, observable criterion>
- [ ] AC2: <binary, observable criterion>

**Validation Method**

| AC | Method |
|----|--------|
| AC1 | <executable, reproducible verification> |
| AC2 | <executable, reproducible verification> |

**Constraints** (if applicable)
- <explicit, actionable, prioritized constraint>

**Risks** (if applicable)

| Risk | Mitigation |
|------|------------|
| <causal risk description> | <mitigatable action> |

**Type-Specific Signals Used**
- <signal 1>
- <signal 2>

## 4. Open Questions

### Blocking
- <question or "None">

### Non-blocking
- <question or "None">

## 5. Readiness Gate
- [ ] Each Objective is single-intent, verifiable, failure-traceable
- [ ] Each Spec field satisfies its quality attributes
- [ ] AC and Validation Methods are 1:1 mapped
- [ ] Dependency graph has no cycles
- [ ] No blocking open question remains

## 6. Approval Record
- Ticket Decision: <Approve|Revise|Stop>
- Notes: <...>
```

## Anti-Patterns

- Asking multi-part questions in one turn.
- Asking open-ended questions without actionable options.
- Collecting details that do not affect ticket decisions.
- Mixing multiple ticket types into one ticket.
- Approving tickets with unresolved blocking questions.
- Writing provider-specific output syntax into artifacts.
- Vague objectives that fail Specific, Testable, or Singular attributes.
- Acceptance criteria without mapped validation methods.
- Out-of-scope items that are not plausibly confused as in-scope.
- Keeping tickets that fail splitting criteria without splitting them.

## Checklist Before Finishing

- [ ] Each ticket meets all three splitting criteria (single intent, immediately verifiable, failure-traceable).
- [ ] Ticket IDs use set-based format and are dependency ordered.
- [ ] Every Spec field satisfies its quality attributes.
- [ ] AC and Validation Methods are 1:1 mapped for every ticket.
- [ ] Conditional fields (Constraints, Risks) appear only when justified.
- [ ] Blocking open questions are fully resolved before approval.
- [ ] Ticket artifact is approved and saved under `docs/tickets/`.
- [ ] All outputs are in English.

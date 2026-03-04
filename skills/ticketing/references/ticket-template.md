# Ticket Template

Use this template when saving initial approved ticket artifacts to
`docs/tickets/`.

````markdown
# Ticket: <topic> (<YYYY-MM-DD>)

**Status:** Draft | Approved
**Topic:** <kebab-case-topic>
**Ticket File:** docs/tickets/<YYYY-MM-DD>-<topic>-ticket.md

## 1. Request Summary
- <summary>

## 2. Dependency Graph

```mermaid
graph TD
  T1["<topic>/1"]
```

## 3. Decomposed Ticket Index

| ID | Type | Goal | Depends On | Status | Wave | Spec Detail Level |
| --- | ---- | ---- | ---------- | ------ | ---- | ----------------- |
| <topic>/1 | Feature | <goal> | - | Provisional | 1 | Full |
| <topic>/2 | Refactoring | <goal> | <topic>/1 | Provisional | 2 | Lean |

## 4. Ticket Details

### <topic>/1 - <title>
**Type:** <Feature|Refactoring|Documentation|Test|Bug|Improvement>
**Current Status:** Provisional
**Wave Candidate:** <1|2|...>
**Spec Detail Level:** <Full|Lean>

#### Provisional Spec

When `Spec Detail Level` is `Full`, fill all fields below.
When `Spec Detail Level` is `Lean`, fill only Lean fields.

**Objective**

(depends_on: <topic>/N) <!-- omit this line if no dependencies -->

- <single-intent objective>

**In-Scope (Provisional)**
- <enumerable, locatable, bounded items>

**Out-of-Scope**
- <negative, firm, relevant exclusions>

**Acceptance Criteria (Draft)**
- [ ] AC1: <binary, observable criterion>
- [ ] AC2: <binary, observable criterion>

**Validation Method (Draft)**

| AC | Method |
|----|--------|
| AC1 | <executable, reproducible verification> |
| AC2 | <executable, reproducible verification> |

**Open Questions**

##### Blocking
- <question or "None">

##### Non-blocking
- <question or "None">

**Lean Fields (only for Lean)**
- depends_on summary: <short dependency intent>
- Tentative In-Scope: <high-confidence likely targets>
- Blocking Open Questions: <question list or "None">

## 5. Wave Index (Initial)

| Wave | Tickets | Entry Condition |
|------|---------|-----------------|
| 1 | <topic>/1 | No unresolved predecessor |
| 2 | <topic>/2 | Wave 1 dependencies done |

## 6. Initial Set Readiness Gate
- [ ] Each ticket satisfies splitting criteria
- [ ] Dependency graph has no cycles
- [ ] Every ticket satisfies required fields for its detail level
- [ ] Open questions are classified (Blocking/Non-blocking)
- [ ] Every ticket status is Provisional

## 7. Revalidation History

| Date | Ticket | Trigger | Outcome |
|------|--------|---------|---------|
| <YYYY-MM-DD> | <topic>/2 | Dependency implementation drift | Updated provisional spec |

## 8. Approval Record
- Ticket Decision: <Approve|Revise|Stop>
- Notes: <...>
````

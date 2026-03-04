# Ticket Template

Use this template when saving approved ticket artifacts to `docs/tickets/`.

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
| <topic>/1 | Feature | <title> | - |
| <topic>/2 | Improvement | <title> | <topic>/1 |

## 3. Ticket Details

### <topic>/1 - <title>
**Type:** <Feature|Refactoring|Documentation|Test|Bug|Improvement>

#### Spec

**Objective**

(depends_on: <topic>/N) <!-- omit this line if no dependencies -->

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

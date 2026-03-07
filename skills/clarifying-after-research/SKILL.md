---
name: clarifying-after-research
description: >-
  After codebase research, systematically identify and resolve knowledge gaps
  before plan drafting begins.
---

# Clarify Gaps After Research

Turn research findings and intent breakdown into a complete knowledge base for
plan drafting.

## Purpose

Research reveals the real shape of the codebase — patterns, constraints, edge
cases — that the original request did not address. This skill forces you to
surface every gap between what you now know and what you need to know before
writing a plan.

## Hard Gate Before Plan Drafting

Do not begin drafting the plan until every gap in the ledger is resolved. An
open gap means the plan will contain a guess.

## When to Skip

Skip this step only when ALL three conditions are true:

1. The request is unambiguous — each sub-intent maps to exactly one code change.
2. Research found no conflicting patterns or surprising constraints.
3. There is a clear 1:1 mapping from every sub-intent to an implementation
   approach.

If any condition is false, run the full process.

## Gap Taxonomy

Use exactly one category per gap:

1. **Ambiguous Requirement** — A sub-intent maps to multiple valid code changes
   and the right choice is unclear.
2. **Missing Business Context** — Research revealed domain branches, feature
   flags, or tier distinctions the request did not address.
3. **Conflicting Patterns** — The codebase uses multiple approaches for the same
   concern and the user did not specify which to follow.
4. **Unclear Priority / Trade-off** — Research surfaced a trade-off (speed vs.
   safety, scope vs. complexity) with no stated preference.
5. **Unknown Constraint** — A hard limitation was discovered (API limit, schema
   restriction, dependency version) that the user may not be aware of.
6. **Scope Boundary** — Adjacent code or functionality that may or may not be in
   scope for this change.

## Process

### Step 1: Build Gap Ledger

After research is complete, enumerate every gap. Each entry needs:

- **ID**: G1, G2, G3...
- **Category**: one of the six above
- **Evidence**: specific file, function, pattern, or finding that created the gap
- **Question**: the single question whose answer resolves this gap
- **Status**: Open

### Step 2: Ask One Question at a Time

For each open gap, ask the user one focused question{{tool.ask_user}}. Cite the
evidence. When relevant, present concrete options rather than open-ended
questions.

### Step 3: Record Resolution

Update the ledger entry:

- Set status to Resolved.
- Record the answer verbatim.
- If the answer reveals a new gap, add it to the ledger with the next ID.

### Step 4: Repeat Until Complete

Loop Steps 2-3 until every gap in the ledger has status Resolved.

### Step 5: Emit Gap Resolution Summary

Output the summary (see Output Contract below) and proceed to plan drafting.

## Output Contract

```text
Gap Resolution Summary
- G1 (Category): question -> answer
- G2 (Category): question -> answer
...
```

Rules:

- Keep each line short and concrete.
- Use the exact category name from the taxonomy.
- Preserve the user's answer faithfully.

## Integration Table

Each gap category feeds specific plan sections:

| Gap Category | Plan Section It Feeds |
|---|---|
| Ambiguous Requirement | Requirements, Implementation Steps |
| Missing Business Context | Context, Assumptions |
| Conflicting Patterns | Assumptions, Implementation Steps |
| Unclear Priority / Trade-off | Assumptions, Trade-offs |
| Unknown Constraint | Constraints, Risks |
| Scope Boundary | Scope (In/Out), Requirements |

## Anti-Patterns

- **Vague questions** — Every question must cite evidence from research and be
  answerable in one response.
- **Batching questions** — Ask one at a time. Batches overwhelm and produce
  shallow answers.
- **Proceeding with open gaps** — An unresolved gap becomes a guess in the plan.
  Never skip.
- **Skipping categories** — Check all six categories against your research
  findings before declaring no gaps.
- **Inventing gaps** — Every gap must trace to a concrete finding. Do not
  fabricate questions to appear thorough.

## Checklist

Before proceeding to plan drafting, verify:

- [ ] All six gap categories were checked against research findings
- [ ] Every gap has an ID, category, evidence, and question
- [ ] Each question was asked individually with evidence cited
- [ ] Every gap in the ledger has status Resolved
- [ ] New gaps from answers were added and also resolved
- [ ] Gap Resolution Summary was emitted in the correct format

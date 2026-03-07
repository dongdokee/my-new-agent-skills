---
name: capturing-intent-before-researching
description: >-
  Use this skill first in Plan Mode before any codebase research to decompose
  user requests into explicit sub-intents and categorize.
---

# Capture Intent Before Researching

Create an intent map before touching the codebase.

## Purpose

Turn a raw user request into a clear, categorized set of sub-intents. This
prevents early research from drifting away from what the user actually asked.

## Hard Gate Before Research

Do not start repository exploration, architecture analysis, or implementation
planning until decomposition and categorization are complete.

## Decomposition Guidance

Decompose only what the user explicitly requested into sub-intent.

Preserve intent and key terms from the user request. Normalize wording only
when it improves clarity without changing meaning.

Decomposition criteria:

- Keep Each sub-intent focused on one actionable and verifiable goal

## Intent Taxonomy

Use exactly one category per sub-intent:

- `Feature`: Add or change user-facing or system capability.
- `Refactoring`: Enhance maintainability (simplification, readability, modularity)
- `Security`: Enhance security (hardening, vulnerability reduction, access/control protection)
- `Performance`: Enhance performance (latency, throughput, memory, CPU, scalability efficiency)
- `Others`: Any intent that does not fit the above categories.

## Classification Guidance

Use judgment instead of a rigid sequence:

- Assign exactly one category to each sub-intent.
- If one sub-intent spans multiple categories, split it into separate
  sub-intents.
- If classification is blocked by ambiguity, ask one focused question at a
  time{{tool.ask_user}}.
- Continue with research/planning after categories are stable.

## Output Contract

Use this structure:

```text
Intent Breakdown
- (<Category[/Subtype]>: <Sub-intent 1>)
- (<Category[/Subtype]>: <Sub-intent 2>)
...
```

Rules:

- Keep each line short and concrete.
- Do not include implied tasks.

## Examples

**Example 1 (single intent)**

User request: `Create a reporting dashboard`

Output:

```text
Intent Breakdown
- (Feature: Create a reporting dashboard)
```

**Example 2 (multiple feature intents)**

User request: `Create a reporting dashboard and add CSV export`

Output:

```text
Intent Breakdown
- (Feature: Create a reporting dashboard)
- (Feature: Add CSV export)
```

**Example 3 (feature + performance)**

User request: `Create a reporting dashboard and improve load speed`

Output:

```text
Intent Breakdown
- (Feature: Create a reporting dashboard)
- (Performance: Improve load speed)
```

**Example 4 (feature + others)**

User request: `Create a reporting dashboard and write a quick-start guide`

Output:

```text
Intent Breakdown
- (Feature: Create a reporting dashboard)
- (Others: Write a quick-start guide)
```

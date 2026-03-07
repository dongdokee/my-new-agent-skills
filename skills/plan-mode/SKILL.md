---
name: plan-mode
description: >-
  Use this skill ALWAYS when operating in Plan Mode, drafting an
  implementation plan, or preparing to exit Plan Mode. Activates on any
  planning activity including "make a plan", "design the approach", or
  "how should we implement this".
---

# Planning Guideline

This skill provides guidance for plan-mode.

## Capture Intent Before Starting Researching Codebase

Start by understanding the user's intent.

### Step 1. Decompose into Sub-intents

**Decomposition Guidance:**

- Decompose only what the user explicitly requested into sub-intent
- If classification is blocked by ambiguity, ask one focused question at a time{{tool.ask_user}}.
- Keep Each sub-intent focused on one **actionable** and **verifiable** goal
- Preserve intent and key terms from the user request. Normalize wording only when it improves clarity without changing meaning.

**Intent Taxonomy:**

- `Feature`: Add or change user-facing or system capability.
- `Refactoring`: Enhance maintainability (simplification, readability, modularity)
- `Security`: Enhance security (hardening, vulnerability reduction, access/control protection)
- `Performance`: Enhance performance (latency, throughput, memory, CPU, scalability efficiency)
- `Others`: Any intent that does not fit the above categories.

### Step 2. Announce after Capture

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

### Examples

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

### Step 3. Load Sections for Plan File

Load the appropriate items based on the sub-intents. Use these items to research the codebase, design the architecture, and create an implementation plan.

**Feature:** Read `references/feature-items.md`
**Else:** Read `references/general-items.md`

## Ask Clarification Questions until All Gaps are filled

**Iron Law:**
> Do not assume. Interview the user until every blocking gap is resolved.

There may be critical gaps between the request and a decision-complete plan. Do
not proceed to design or planning while blocking gaps remain open.

**Question Guidance:**
- Keep asking clarification questions until all blocking gaps are resolved.
- Do not ask open-ended questions. Use close-ended formats only:
  single-selection or multiple-selection.
- Ask one focused question at a time{{tool.ask_user}}.
- For every question, provide a recommended option, concise reasoning, and
  trade-offs for non-recommended options.

In the following cases, ALWAYS ask clarification questions to the user.

### Pattern 1. Before Research

If any missing detail blocks efficient codebase research (entrypoint, target
area, environment, or constraints), ask the user before starting research.

### Pattern 2. After Research, Before Design

If any missing detail blocks design decisions (requirements, scope boundaries,
compatibility constraints, or priorities), ask the user before drafting the
design.

**Example concerns:**

- Technical implementation direction
- UI & UX concerns
- Design trade-offs

### Pattern 3. During design

Always present 2-3 viable approaches with explicit trade-offs, recommend one
approach, and ask the user to choose before finalizing the plan.

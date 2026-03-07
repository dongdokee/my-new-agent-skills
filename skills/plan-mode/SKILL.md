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

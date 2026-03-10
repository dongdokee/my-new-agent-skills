---
name: agile-requirements
description: "Translate ideas, business requirements, or legacy code into structured Agile documentation (Epic, User Stories, Acceptance Criteria). Use when breaking down features into stories, writing acceptance criteria, reverse-engineering requirements from code, creating epics, defining user stories with Given/When/Then, or structuring product requirements into Agile format."
---

# Agile Requirements Engineer

## Overview

Turn ambiguous ideas, business requirements, or existing code into structured Agile documentation: Epic with Global CRAD, User Stories by type, and testable Acceptance Criteria in Given/When/Then format.

<HARD-GATE>
Do NOT produce Epic/Story output until you have completed the Context Assessment and gathered enough information to write testable, specific acceptance criteria. Vague input produces vague output — keep interviewing until every AC can be expressed as a concrete Given/When/Then.
</HARD-GATE>

## Checklist

You MUST create a task for each of these items and complete them in order using {{tool.task_tracking}}:

1. **Assess input source** — new initiative or reverse engineering from code
2. **Gather context** — interview user or analyze codebase until ambiguity resolved
3. **Define Epic** — Goal, KPIs, Global CRAD, Out of Scope
4. **Break down Stories** — typed (Feature/Spike/Enabler/Tech Debt/Defect/Chore)
5. **Detail each Story** — As a/I want/So that + Local Notes + Given/When/Then ACs
6. **Validate completeness** — every AC testable, no global/local redundancy
7. **Present to user** — get approval or iterate

## Process

### Step 1: Input Analysis

Determine the input type:

**New initiative or enhancement:**
- Ask the user to describe the idea, business goal, or requirement{{tool.ask_user}}.
- One question at a time — do not batch.
- Focus: Who are the users? What problem? What does success look like? What constraints?

**Reverse engineering from existing code:**
- Use {{tool.search}} and {{tool.file_discovery}} to scan relevant modules.
- Use {{tool.file_read}} to understand current behavior.
- Analyze: Entry Points (UI/API) for the "What", Service Logic for "Constraints", Data Model for "Value".
- Use existing tests to extract edge-case Acceptance Criteria.
- Present findings to user for validation{{tool.ask_user}}.

**Keep interviewing until you can answer:**
- Who are the distinct user personas?
- What is the measurable business value?
- What are the system boundaries and constraints?
- What is explicitly out of scope?

### Step 2: Epic Definition

Define exactly one Epic:

- **Goal**: one sentence business outcome
- **KPIs**: 2-4 measurable indicators (numbers, not adjectives)
- **Global CRAD** (applies to ALL stories):
  - **Constraints**: system-wide limitations (legal, performance, technical)
  - **Risks**: uncertainties with likelihood/impact (H/M/L)
  - **Assumptions**: foundational hypotheses taken as true
  - **Dependencies**: external blockers (APIs, teams, decisions)
- **Out of Scope**: explicit exclusions

**Rule: Global CRAD must NOT be repeated in individual stories.** Story-specific constraints go in Local Notes only.

### Step 3: Story Breakdown

Assign each story a type:

| Type | Purpose | Example |
|------|---------|---------|
| **Feature** | User-facing functionality | "Filter search results by date" |
| **Spike** | Research with time-box | "Evaluate OAuth providers (2d)" |
| **Enabler** | Infrastructure for future features | "Set up CI/CD pipeline" |
| **Tech Debt** | Improve without behavior change | "Refactor to strategy pattern" |
| **Defect** | Fix broken behavior | "Fix cart total not updating" |
| **Chore** | Maintenance, no user-visible change | "Upgrade deps to latest LTS" |

Guidelines:
- Each story = one independently testable value increment
- 1-5 days of work per story; split if larger
- Order by dependency, then by value

### Step 4: Story & AC Detailing

**User Story:**
```
As a [persona],
I want [action],
So that [measurable benefit].
```

**Local Notes:** story-specific constraints only (never duplicate Global CRAD).

**Acceptance Criteria** (Given/When/Then):
```
AC-[N]: [Short title]
Given [precondition with specific data],
When [action with specific trigger],
Then [observable outcome with measurable assertion].
```

**Hard rules:**
- Every AC must be independently testable by someone who has never seen the code.
- Banned vague words: "appropriate", "quickly", "properly", "correctly", "as expected". Use specific values/thresholds.
- At least one happy path + one error/edge case per story.
- If you cannot write a specific Given/When/Then, the requirement is unclear — ask{{tool.ask_user}}.
- **Tech Debt/Defect ACs**: focus on regression ("existing tests must pass") or restoring baseline behavior.

## Output Template

```markdown
# Epic: [Title]

**Goal:** [One sentence]
**KPIs:**
- [Measurable indicator]

## Global CRAD
**Constraints:** [C1]
**Risks:** [R1] (Likelihood: H/M/L | Impact: H/M/L)
**Assumptions:** [A1]
**Dependencies:** [D1]

## Out of Scope
- [Exclusion]

---

## ST-01: [Title] `[Type]`

**As a** [persona], **I want** [action], **So that** [benefit].

**Local Notes:** [Story-specific only]

**Acceptance Criteria:**

AC-1: [Title]
Given [precondition],
When [action],
Then [outcome].
```

## Key Principles

- **Strict hierarchy** — Epic → Stories → ACs. No cross-level mixing.
- **No redundancy** — Global CRAD inherited by all stories. Never repeat at story level.
- **Testability over completeness** — 3 specific ACs beat 10 vague ones.
- **Value-driven ordering** — highest value and dependency-unblocking first.
- **One question at a time** — never batch interview questions.
- **Interview before output** — HARD-GATE is non-negotiable.

---
name: research
description: >-
  Unified research workflow for intent discovery, requirement clarification,
  codebase-first exploration, design synthesis, and research ticket authoring.
  Use when users ask to understand a problem, refine requirements, investigate
  implementation details, explore architecture, evaluate options, or produce a
  decision-ready research artifact.
---

# Research

Create a decision-ready research ticket from ambiguous user requests.

## Purpose

Convert unclear goals into validated requirements and a frozen design, backed
by evidence from codebase exploration and optional web research.

## When to Use

- Clarify user intent before planning or implementation.
- Derive explicit requirements from vague requests.
- Investigate codebase behavior to validate assumptions.
- Compare design options and select one.
- Produce a structured research ticket for handoff.

## The Iron Law

- Do not freeze requirements or design before collecting evidence.
- Use codebase evidence first; use web research only when codebase evidence is
  insufficient.
- If this skill is explicitly invoked by the user or orchestrator, operate in
  research-only mode.
- Before Step 5 freeze approval, do not edit implementation code, tests, or
  automation scripts.
- Move to implementation only after explicit user approval of frozen
  requirements and design.
- Do not claim completion without a ticket artifact at
  `docs/plans/YYYY-MM-DD-<topic>-research.md`.

## Input / Output Contract

- Input: user goal, question, or topic requiring clarification and design.
- Output: `docs/plans/YYYY-MM-DD-<topic>-research.md`
- Required output structure: use `references/ticket-template.md` exactly.

## Process

**REQUIRED:** Use {{tool.task_tracking}} to create a task for each step.
You MUST create a task for each of these steps and complete them in order:

### Step 1: Intent Interrogation

- Ask one question at a time.
- Prefer multiple-choice framing when possible.
- Capture: problem, audience, success criteria, constraints, and non-goals.
- Use `references/question-playbook.md` for question patterns.

### Step 2: Preliminary Requirements

- Draft functional and non-functional requirements from user intent.
- Mark in-scope and out-of-scope explicitly.
- Record assumptions, unknowns, and validation targets.
- Treat this as a draft, not a freeze.
- Present the draft to the user; do not advance to Step 3 without explicit confirmation.
- Use `references/question-playbook.md` Phase 2 approval gate for framing.
- If the user changes problem definition or goals, return to Step 1.

### Step 3: Targeted Exploration

- Explore only what is needed to validate the draft requirements.
- Start with codebase exploration:
  - Use `code-explorer` to trace implementation and collect evidence.
  - Start with one `code-explorer` pass.
  - Expand to 2-3 parallel `code-explorer` passes only when evidence is low-confidence, conflicting, or incomplete.
  - Each pass must return:
    - Core files (3-5 by default, up to 10 when complexity warrants) with relevance notes
    - Execution/data flow summary
    - Constraints from config, tests, interfaces, and dependencies
    - Risks or discrepancies
    - Open questions
    - Confidence (`high`, `medium`, or `low`)
  - Merge pass outputs, deduplicate file lists, and map evidence to each major requirement.
  - Read core flow files first, then supporting utilities/config/tests.
  - Trace data flow and constraints.

If codebase evidence is insufficient:

- Use `web-researcher` with a focused question.
- Record source links and evidence relevance in findings.

Use `references/exploration-checklist.md` to avoid shallow exploration.

### Step 4: Design Synthesis

- Build design options from exploration findings.
- Compare trade-offs against requirements.
- Present all options with trade-off analysis and wait for explicit user selection.
- Record the user's selection and their stated rationale.

### Step 5: Validated Requirements and Final Design Freeze

- Reconcile draft requirements with exploration evidence.
- Produce the validated requirement set.
- Confirm Success Criteria and Validation Method with the user.
- Present the full freeze proposal (requirements, design, success criteria, validation method) and request explicit user approval.

If the user rejects, run the loop in `references/rejection-loop.md`.

### Step 6: Ticket Authoring

- Create the artifact at:
- `docs/plans/YYYY-MM-DD-<topic>-research.md`
- Follow `references/ticket-template.md`.
- Include ADR-lite fields in the ticket.
- If rejection loops occurred, include a concise change log.

## Integration

- Next step for implementation planning: invoke `rpikit:writing-plans`.
- For deeper unresolved research: return to Process step 3.
- For major long-lived architectural impact:
- Optionally create `docs/adr/YYYY-MM-DD-<topic>-adr.md` and link from ticket.

## Anti-Patterns

- Starting implementation immediately after explicit skill invocation.
- Switching to implementation before Step 5 freeze approval and explicit user
  approval.
- Freezing requirements or design without evidence from exploration.
- Exploring the entire codebase without a validation target.
- Using web research as a default instead of a fallback.
- Declaring completion without a research ticket artifact.

## Checklist After Completion

- [ ] User intent and success criteria are explicit.
- [ ] Preliminary requirements are documented with assumptions.
- [ ] Exploration evidence supports the design decision.
- [ ] Requirements and design are frozen with explicit approval.
- [ ] Ticket matches `references/ticket-template.md`.
- [ ] ADR-lite section is complete.
- [ ] Open questions and next actions are documented.

## Markdown Validation

After writing the ticket, invoke skill `rpikit:markdown-validation` and fix
all markdown issues before presenting the final artifact.

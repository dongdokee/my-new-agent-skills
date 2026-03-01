# Research Ticket: Research Skill Evaluation Suite Design (2026-03-01)

## 1. Problem Statement

The `research` skill is a critical component for handling ambiguous user requests. However, its adherence to the "Iron Law" (codebase-first exploration) and the quality of its output (Research Ticket) are currently verified only through manual observation. To ensure long-term reliability and prevent regressions, a structured, automated evaluation suite is required that aligns with the standards in `docs/eval-skills/eval-skills.md`.

## 2. Intent Summary

- **Goal:** Design a comprehensive evaluation suite to verify the trigger reliability, process compliance, and artifact quality of the `research` skill.
- **Audience:** Local developers working on agent skills.
- **Success Criteria:** A validated design for a test dataset (CSV), deterministic process checks (JSONL), and a qualitative scoring rubric (JSON Schema).
- **Constraints:** The design must be modular, runnable locally, and strictly follow the patterns established in `docs/eval-skills/eval-skills.md`.
- **Non-goals:** Implementing the actual scripts or executing the evaluations during this research phase.

## 3. Preliminary Requirements

### Functional Requirements (Draft)

- **Test Dataset:** Create a CSV with 15-20 prompts (Explicit, Implicit, Negative).
- **Deterministic Checks:** Validate the sequence of the 6-step research process.
- **Artifact Validation:** Ensure the output file matches `references/ticket-template.md` and contains no implementation code.
- **Scoring Rubric:** Define a JSON schema for qualitative assessment of the interrogation and exploration phases.

### Non-Functional Requirements (Draft)

- **Reproducibility:** All test runs must generate a `trace.jsonl` for debugging.
- **Extensibility:** Easy to add new test cases as regressions are found.

### Scope (Draft)

- **In scope:** Test case definitions, JSONL event matching logic, and rubric schema design.
- **Out of scope:** CI/CD integration and performance benchmarking.

### Assumptions and Unknowns

- **Assumption:** The `research` skill will continue to use the standard tools (`grep_search`, `read_file`, etc.) for exploration.
- **Unknown:** How to effectively simulate multi-turn conversations in a non-interactive automated test environment.

## 4. Exploration Findings

### Codebase Findings

| File | Purpose | Evidence |
| --- | --- | --- |
| `skills/research/SKILL.md` | Core process definition | Defines 6 mandatory steps and "Iron Laws". |
| `docs/eval-skills/eval-skills.md` | Evaluation standard | Mandates the `Input -> Trace -> Rule -> Score` pipeline. |
| `skills/research/references/` | Artifact templates | `ticket-template.md` provides the structural baseline for validation. |

## 5. Design Decision

### Chosen Option: Option A (Integrated JavaScript Runner)

This approach uses a single Node.js script to manage the lifecycle of an evaluation run, combining deterministic trace analysis with qualitative rubric scoring.

### Alternatives Considered

- **Option B (Artifact-Centric):** Fast but misses process violations (e.g., skipping codebase exploration).
- **Option C (Process-Only):** Strict but doesn't guarantee the final ticket is actually useful to a developer.

### Decision Rationale

Option A is the only approach that satisfies all three goals (Process, Outcome, Style) defined in the evaluation guide while remaining consistent with the existing `docs/eval-skills/scripts/` architecture.

## 6. Validated Requirements

- **Multi-Turn Simulation:** The evaluation script must support a "Dialogue Script" to answer the skill's interrogation questions automatically.
- **Process Compliance:** Must verify that `grep_search` or `glob` is called before any `web_fetch` or `google_web_search`.
- **Structural Integrity:** The final ticket must contain all 10 mandatory sections from the template.

## 7. Architectural Decision Record (ADR-lite)

- **Context:** Need to automate verification of a complex, multi-step LLM workflow.
- **Decision:** Use an Integrated JavaScript Runner that parses `trace.jsonl` and applies a JSON Schema-based rubric.
- **Alternatives Considered:** Manual testing, Shell-script based grep checks.
- **Consequences:** Requires maintenance of the JS runner and dialogue scripts; provides high confidence in skill reliability.
- **Evidence:** Success of similar patterns in the `setup-demo-app` evaluation suite.

## 8. Risks and Constraints

- **Risk:** Flaky test results due to LLM variability in interrogation questions.
- **Mitigation:** Use fuzzy matching or category-based response scripts for the interrogation phase.
- **Constraint:** Limited to local execution due to the cost and time of running 20+ research cycles.

## 9. Open Questions

- Should we include a "Hallucination Check" in the rubric to verify that exploration findings actually match the referenced files?

## 10. Next Actions

- [ ] Create `docs/eval-skills/research-eval.prompts.csv` with 20 test cases.
- [ ] Define `docs/eval-skills/research-rubric.schema.json`.
- [ ] Implement `docs/eval-skills/scripts/run-research-evals.mjs`.

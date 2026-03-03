# Session Archive Plan: ticketing next iteration

This plan records next improvements discussed or implied during this session.
It intentionally does not follow the repository's `docs/plans/*-plan.md` format.

## Goal

Move `ticketing` from draft MVP to a stable, token-efficient, trigger-precise workflow.

## Improvement tracks

### Track A: Trigger precision

- Tighten `SKILL.md` frontmatter description further based on real mis-trigger logs.
- Add explicit "use / not use" discriminators against overlapping skills.
- Validate trigger behavior with prompt set in `docs/tests/ticketing-skill-prompts.md`.

### Track B: Token efficiency and conciseness

- Reduce repeated mandatory phrasing in interview loops.
- Keep required question structure, but trim redundant wording and examples.
- Consider extracting large templates to `references/` only when maintenance overhead becomes worth it.

### Track C: Agentic workflow safety

- Add explicit revise-loop control rule (for example: iteration cap + escalation behavior).
- Define what happens when blocking questions persist after repeated clarification attempts.
- Keep approval gates strict while minimizing unnecessary turn expansion.

### Track D: Evaluation harness

- Use the 5 repository-specific prompts as baseline.
- Compare actual ticket decomposition order against the documented expected sequence.
- Track failure modes:
  - wrong ticket type ordering
  - missing required common fields
  - premature approval with unresolved blocking questions

## Proposed execution order

1. Run prompt-based evaluation on current draft (`baseline`).
2. Apply trigger and wording refinements in small diffs.
3. Re-run evaluation and compare decomposition quality and token footprint.
4. Add loop-safety guardrails.
5. Re-run end-to-end and freeze draft-v2.

## Exit criteria for draft-v2

- Trigger quality improves on ambiguous prompts.
- Ticket decomposition is consistently aligned with expected sequence intent.
- No unresolved blocking question slips through approval.
- Prompt-to-ticket flow becomes shorter without losing required decision data.


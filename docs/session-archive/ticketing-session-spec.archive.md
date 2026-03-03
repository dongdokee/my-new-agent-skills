# Session Archive Spec: ticketing skill workstream

This document is a raw archive of what was decided and delivered in this session.
It intentionally does not follow the repository's `docs/plans/*-ticket.md` format.

## Scope captured in this session

- Create the first draft of `ticketing` skill.
- Position `ticketing` as a ticket-first workflow:
  - decompose ambiguous requests into sequential tickets
  - collect planning-critical information
  - get approval
  - draft and approve implementation plan
- Keep outputs platform-neutral across Claude Code, Gemini CLI, and Codex.
- Add repository-specific prompts to test `ticketing` behavior.

## Key decisions from the conversation

1. `ticketing` is ticket-focused and plan-capable in the same flow.
2. Plan output must be platform-neutral markdown (no provider-specific wrapper like `<proposed_plan>`).
3. Artifact paths:
   - ticket: `docs/tickets/YYYY-MM-DD-<topic>-ticket.md`
   - plan: `docs/plans/YYYY-MM-DD-<topic>-plan.md`
4. `<topic>` token policy: `snake_case`, no `-` inside token.
5. Common required fields remain fixed; type-specific items are signal examples (agent-judged).
6. Readiness gate is semantic (not numeric count-based).
7. Use ADR in plan; do not force additional sections (findings/assumptions/risk triggers/traceability) as mandatory standalone blocks.
8. `ticketing` v1 remains MVP/draft and requires later improvement.
9. `description` was refined to improve trigger precision and avoid overloading with execution details.

## Files created/updated in this session

- `skills/ticketing/SKILL.md` (new, then description refined)
- `skills/ticketing/skill.yaml` (new)
- `README.md` (skills table updated)
- `installer/src/__tests__/pipeline.test.ts` (ticketing discovery + command generation tests)
- `docs/tests/ticketing-skill-prompts.md` (new, later expanded with expected ticket sequence)

## Commits produced in this session

- `6492555` — `feat: add draft ticketing skill and command scaffold`
- `6fc70af` — `chore: refine ticketing trigger description`
- `d578a7f` — `test: add ticketing skill prompt set for repo workflow` (amended version including expected sequences)

## Validation done in-session

- Ran `installer` test target:
  - `npm test -- --run src/__tests__/pipeline.test.ts`
  - result at run time: all tests passed.


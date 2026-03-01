# Question Playbook

Use these prompts to keep interrogation focused and decision-oriented.

## Global Rules

- Ask one question at a time.
- Prefer multiple-choice framing when practical.
- Keep options mutually exclusive.
- Confirm understanding before moving phases.

## Phase 1: Intent Interrogation

### Goal Clarification

```text
What outcome do you need most?
- Understand current behavior (recommended)
- Define a change to implement
- Evaluate architecture choices
```

### Audience Clarification

```text
Who is this primarily for?
- End users (recommended)
- Internal developers
- Operations/support teams
```

### Success Criteria

```text
How will we know this is successful?
- Measurable functional result (recommended)
- Reduced complexity/maintenance burden
- Better reliability/performance/security
```

## Phase 2: Preliminary Requirements

### Priority

```text
Which requirement priority should drive trade-offs?
- Correctness and reliability (recommended)
- Delivery speed
- Flexibility/extensibility
```

### Scope Boundary

```text
What scope boundary should we keep?
- Minimal viable scope (recommended)
- Standard feature-complete scope
- Broad future-ready scope
```

## Phase 5: Final Freeze Gate

### Approval Check

```text
Do you approve this frozen set?
- Approve requirements and design (recommended)
- Reject requirements, revise scope
- Reject design, revisit options
- Need more evidence before approval
```

If rejected, follow `references/rejection-loop.md`.

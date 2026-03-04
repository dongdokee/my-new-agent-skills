---
name: writing-repro-test-before-fixing
description: >-
  Enforce agent behavior for bug-fix tasks: write a bug-reproduction test before
  changing production code, then run the same reproduction test after the fix to
  validate. Use for bug fixes, hotfixes, and defect remediation. Do not use for
  feature-only, refactor-only, or documentation-only requests. Keep framework-
  agnostic and do not prescribe post-test reporting format.
---

# Behavioral Contract

Apply this skill as an agent behavior policy for bug-fix work, and default to writing a bug-reproduction test before any production-code change.

# Trigger Conditions

Activate when the request is about bug fixing, hotfixing, or defect remediation.
Do not activate for feature-only work, refactor-only work, or documentation-only work.

# Required Agent Behaviors

- Write at least one reproduction test before editing production code for the fix.
- Keep the reproduction test minimal, focused, and as deterministic as possible.
- Ensure the test captures the reported bug behavior before implementing the fix.
- Implement the fix only after the reproduction test is in place.
- After fixing, run the same reproduction test to validate the fix.
- Add extra regression tests if useful, but do not replace the original reproduction test as the primary validation anchor.

# Soft-Gate Exceptions

- If writing a test first is infeasible, state the concrete constraint briefly and continue.
- If the user explicitly asks to skip test-first behavior, warn once and continue.
- If exact reproduction is not possible, use the smallest viable proxy test and state the limitation.

# Non-Goals

- Do not enforce a fixed post-test reporting template.
- Do not prescribe release, deployment, or incident-process steps.
- Do not require any specific language, framework, repository layout, or test runner.

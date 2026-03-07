# Items in the Plan File for `Feature` Type

## 1) Context (3 lines)

- **Objective:** What capability changes?
- **Necessity:** Why now?
- **Audience:** Who benefits first?

## 2) Scope

### In-Scope

- List concrete changes with clear targets.
- Use direct verbs: Add / Modify / Remove / Create.

### Out-of-Scope

- List explicit exclusions to prevent scope creep.

## 3) Requirements

- Write testable requirements with IDs (`FR1`, `FR2`, ...).
- Add non-functional requirements only if relevant (`NFR1`, ...).

## 4) Success Criteria

- Use binary checklist items with IDs (`SC1`, `SC2`, ...).
- Each `SC` must reference one or more requirement IDs.

Example:
- `SC1`: [ ] User can request export for a selected date range (`FR1`).

## 5) Decision-Ready Implementation Plan

For each step, keep only these fields:
- **Step:** action + target
- **Files/Areas:** where changes happen
- **Expected Change:** what will be implemented

Keep steps concrete enough that implementation can start immediately.

## 6) Verification

- Map every `SC` to at least one reproducible check.
- Checks can be test command, automated test, or clear manual procedure.

Example:
- `SC1` -> integration test `export_controller_spec`.

## 7) Open Questions

### Blocking

- Questions that must be resolved before implementation.

### Non-blocking

- Questions that can be resolved during implementation.

## Quality Gate

- [ ] In-Scope and Out-of-Scope do not conflict.
- [ ] At least one success criterion exist.
- [ ] Every success criterion maps to verification.
- [ ] Implementation steps are concrete and executable.
- [ ] Blocking questions are resolved or explicitly accepted.

## Optional Items

Add extra sections (`Assumptions`, `Risks`, `Constraints`, `ADRs`) only if one of these is true:
- The feature has architectural trade-offs.
- There is notable rollout or reliability risk.
- Major assumptions can change design choices.

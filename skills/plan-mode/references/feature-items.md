# Plan: `<title>`

## Context

- **Objective:** <WHAT is the objective?>
- **Necessity:** <WHY now?>
- **Audience:** <WHO benefits first?>
- **Expected Output:** <WHAT success looks like in business?>

## Specifications

### Requirements

<!-- if requirements can be described as user story and acceptance criteria -->
- US-01: `As a <role>, I can <capability> so that <receive benefit>`
  - AC-01:
  ```
  Feature: <feature>
  Scenario: <scenario>
    Given: <given>
    When: <when>
    Then: <then>
  ```
- US-02: ...

<!--
otherwise, use Easy Approach to Requirements Syntax (EARS):
- Ubiquitous (always true): `R1: The <system> shall <response>.`
- State-driven: `R2: While <precondition(s)>, the <system> shall <response>.`
- Event-driven: `R3: When <trigger>, the <system> shall <response>.`
- Optional feature/scope: `R4: Where <feature/scope applies>, the <system> shall <response>.`
- Unwanted behavior: `R5: If <unwanted condition>, then the <system> shall <mitigation>.`
- Complex: `R6: While <precondition(s)>, when <trigger>, the <system> shall <response>.`
-->

- R1: <requirement in EARS>
- R2: ...
  
### Success Criteria

<!--
How to check success of meeting requirements?:
- acceptance criteria: write acceptance test

아 머리아파 ㅋㅋ
-->

- 

- Use binary checklist items with IDs (`SC1`, `SC2`, ...).
- Each `SC` must reference one or more requirement IDs.

Example:
- `SC1`: [ ] User can request export for a selected date range (`FR1`).

### Assumptions

- Assumption: <falsifiable statement> | If wrong: <consequence and mitigation>
- Assumption: <falsifiable statement> | If wrong: <consequence and mitigation>

### Risks

### Constraints

### Architectural Decision Records

## Implementation Plan

### In-Scope

- List concrete changes with clear targets.
- Use direct verbs: Add / Modify / Remove / Create.

### Out-of-Scope

- List explicit exclusions to prevent scope creep.

## Decision-Ready Implementation Plan

For each step, keep only these fields:
- **Step:** action + target
- **Files/Areas:** where changes happen
- **Expected Change:** what will be implemented

Keep steps concrete enough that implementation can start immediately.

## Verification

- Map every `SC` to at least one reproducible check.
- Checks can be test command, automated test, or clear manual procedure.

Example:
- `SC1` -> integration test `export_controller_spec`.

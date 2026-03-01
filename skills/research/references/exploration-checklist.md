# Exploration Checklist

Use this checklist before concluding exploration.

## Preparation

- [ ] Confirm which requirements or assumptions need validation.
- [ ] Define the exact question each exploration pass must answer.
- [ ] Identify likely files/components before broad searching.

## Codebase-First Investigation

- [ ] Locate core files with `file-finder`.
- [ ] Read primary flow files before utility files.
- [ ] Trace data flow from input to output.
- [ ] Identify constraints from config, tests, and interfaces.
- [ ] Capture evidence with file paths and key line/behavior references.

## Web Research Fallback

Run web research only when at least one of these is true:

- [ ] External dependency behavior is unclear in local code/docs.
- [ ] Version-specific API/policy/security detail is missing locally.
- [ ] Comparative external best practice is needed for decision confidence.

When web research is used:

- [ ] Record source links.
- [ ] Record why each source is relevant.
- [ ] Record confidence level of conclusions.

## Exit Criteria

- [ ] Each major requirement has evidence.
- [ ] Design options are informed by evidence, not assumptions.
- [ ] Remaining unknowns are explicitly listed as open questions.

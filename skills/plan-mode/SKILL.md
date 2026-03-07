---
name: plan-mode
description: >-
  Use this skill ALWAYS when operating in Plan Mode, drafting an
  implementation plan, or preparing to exit Plan Mode. Activates on any
  planning activity including "make a plan", "design the approach", or
  "how should we implement this".
---

# Planning Guideline

This skill provides guidance for plan-mode.

## Capture Intent Before Starting Researching Codebase

Start by understanding the user's intent.

### User's intent category

**Feature:**
[TBD]

**Improvement:**
- Maintainability (alias Refactoring)
- Security
- Performance

**Others:** [TBD]

### Process

#### Step 1. Identify if the user's intent can be decomposed into sub-intents

[TBD: Examples]


#### Step 2: Identify what to research intensively

**Feature:**



## Filling the Gaps After Researching Codebase

[TBD: about asking clarifying questions]



## Required Sections

Every plan MUST include ALL of the following sections. Refer to
`references/plan-template.md` for the fill-in-the-blank template.

### Context

**Purpose:** Establish WHAT is being done, WHY it matters, and WHO benefits.

**Quality criteria:**
- States the objective in one sentence
- Explains the motivation (bug report, feature request, tech debt, etc.)
- Identifies the stakeholder or user affected

**Anti-pattern:**
```
Context: We need to fix the login flow.
```

**Good example:**
```
Context: Users on mobile devices cannot complete OAuth login because the
redirect URI handling fails on iOS Safari. This blocks ~15% of mobile
signups. Fixing this unblocks the Q1 mobile adoption goal.
```

### In-Scope

**Purpose:** Define the complete, bounded set of work.

**Quality criteria:**
- Each item is specific and locatable (file, module, API endpoint)
- Collectively exhaustive - no hidden work
- Enumerable - you can count the items

**Anti-pattern:**
```
- Fix authentication
- Update tests
```

**Good example:**
```
- Modify `src/auth/oauth.ts:handleRedirect()` to support universal links
- Add Safari-specific redirect test in `tests/auth/oauth.test.ts`
- Update `docs/auth.md` redirect URI section
```

### Out-of-Scope

**Purpose:** Draw firm boundaries to prevent scope creep.

**Quality criteria:**
- Each exclusion is relevant (someone might reasonably expect it)
- Stated as negative ("will NOT"), not vague
- Explains why if the exclusion is surprising

**Anti-pattern:**
```
- Other stuff
```

**Good example:**
```
- Will NOT refactor the OAuth provider abstraction (separate concern)
- Will NOT add support for Android deep links (tracked in ISSUE-456)
```

### Assumptions

**Purpose:** Surface hidden premises so they can be validated.

**Format:** Each assumption follows the pattern:
`Assumption: <statement> | If wrong: <consequence and mitigation>`

**Quality criteria:**
- Each assumption is falsifiable
- Consequences of being wrong are stated
- Critical assumptions are verified before plan finalization

**Anti-pattern:**
```
- The API works correctly
```

**Good example:**
```
- Assumption: iOS Safari supports Universal Links for custom schemes
  registered in apple-app-site-association | If wrong: Must fall back to
  SFSafariViewController with a custom redirect page
- Assumption: The OAuth provider returns the same token format for all
  redirect methods | If wrong: Token parsing in `parseCallback()` needs
  a conditional branch per redirect type
```

### Risks

**Purpose:** Identify what could go wrong and how to handle it.

**Format:** Use the risk table:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| <what could go wrong> | Low/Med/High | Low/Med/High | <specific action> |

**Quality criteria:**
- Each risk is specific (not "something might break")
- Mitigation is actionable, not "be careful"
- High-impact risks have concrete fallback plans

### Constraints

**Purpose:** Document technical, business, or process limitations that
bound the solution space.

**Quality criteria:**
- Each constraint is specific and verifiable
- Source of constraint is identified (tech limitation, policy, deadline)

**Good example:**
```
- Must maintain backward compatibility with API v2 clients
- Cannot add new npm dependencies (bundle size budget exceeded)
- Must complete before March release freeze (2026-03-15)
```

### Requirements

**Purpose:** State functional and non-functional requirements explicitly.

**Quality criteria:**
- Functional requirements describe observable behavior
- Non-functional requirements have measurable thresholds
- Each requirement maps to at least one verification step

**Good example:**
```
Functional:
- OAuth redirect must complete successfully on iOS Safari 16+
- Token refresh must work after redirect-based login

Non-functional:
- Redirect flow must complete within 3 seconds on 3G connection
- No new runtime dependencies added
```

### Success Criteria

**Purpose:** Define binary, observable conditions that determine if the
plan succeeded.

**Quality criteria:**
- Each criterion is testable (yes/no answer)
- Collectively they cover all requirements
- Specific enough that two people would agree on pass/fail

**Anti-pattern:**
```
- Login works better on mobile
```

**Good example:**
```
- [ ] OAuth login completes successfully on iOS Safari 16+ simulator
- [ ] Existing OAuth tests pass without modification
- [ ] New redirect test covers Safari universal link flow
- [ ] No increase in bundle size beyond 1KB
```

### Decision-Complete Implementation Plan

**Purpose:** Provide a step-by-step execution guide that requires zero
design decisions from the implementor.

**Quality criteria:**
- Every step specifies exact file path(s) and function(s)
- Dependencies between steps are explicit (ordering)
- Each step is tagged with scope: `[S]` small, `[M]` medium, `[L]` large
- No step says "figure out", "decide", or "choose"

**Format:**

```
### Step N: <action verb> <what>

**Files:** `path/to/file.ts`
**Scope:** [S]

<Precise description of what to change, add, or remove.
Include function signatures, data structures, or logic
when the change is non-trivial.>
```

**Anti-pattern:**
```
Step 1: Fix the redirect handling
Step 2: Add tests
Step 3: Update docs
```

**Good example:**
```
### Step 1: Add universal link handler

**Files:** `src/auth/oauth.ts`
**Scope:** [M]

Add `handleUniversalLink(url: URL): AuthResult` after line 45.
Extract scheme and code from URL path segments. Reuse existing
`exchangeCode()` for token exchange. Return `AuthResult` with
the same shape as `handleRedirect()`.

### Step 2: Route Safari to universal link flow

**Files:** `src/auth/oauth.ts`
**Scope:** [S]

In `initiateLogin()`, detect Safari via `navigator.userAgent`.
When Safari, set `redirect_uri` to the universal link endpoint
instead of the custom scheme.
```

### Verification

**Purpose:** Define how each success criterion will be checked.

**Quality criteria:**
- 1:1 mapping with Success Criteria
- Each verification step is executable (command, test, manual check)
- Automated checks preferred over manual

**Format:**

| Success Criterion | Verification Method |
|-------------------|-------------------|
| OAuth login on Safari | Run `npm test -- --grep "safari"` + manual test on simulator |
| Existing tests pass | Run `npm test` - zero failures |

## Optional Sections

Include these when relevant:

- **Open Questions** - Unresolved items that need answers before or during
  implementation. Classify as Blocking (must resolve before starting) or
  Non-blocking (can resolve during implementation).
- **Alternatives Considered** - Other approaches evaluated and why they
  were rejected. Useful for documenting design rationale.
- **Dependencies** - External dependencies (other teams, PRs, releases)
  that affect timing or feasibility.

## Process

Follow these steps when creating a plan:

### 1. Understand the Request

Read the user's request carefully. If ambiguous, ask clarifying questions
one at a time{{tool.ask_user}}.

### 2. Investigate the Codebase

Before writing anything, gather evidence:

- Use {{tool.file_discovery}} to find relevant files and understand project
  structure
- Use {{tool.search}} to locate specific functions, patterns, and usages
- Use {{tool.file_read}} to read and understand the actual implementation

Do NOT skip this step. Plans based on assumptions about code that hasn't
been read are plans that will fail.

### 3. Draft the Plan

Write all Required Sections. Use `references/plan-template.md` as a
starting scaffold. Fill every section with concrete, evidence-grounded
content.

### 4. Self-Review Against Quality Gates

Before presenting the plan, verify it passes ALL quality gates below.
Fix any failures before finishing.

### 5. Present and Iterate

Present the plan to the user. Incorporate feedback. Do not exit Plan Mode
until all quality gates pass.

## Quality Gates

The plan is NOT ready until ALL of these pass:

- [ ] **No TBD or placeholders** - Every section has concrete content
- [ ] **No vague steps** - Every implementation step has file paths and
  function names
- [ ] **No unverified claims** - Every statement about existing code was
  confirmed by reading the source
- [ ] **Success criteria are binary** - Each criterion has a clear yes/no
  answer
- [ ] **Verification covers all criteria** - 1:1 mapping between success
  criteria and verification methods
- [ ] **Steps are ordered** - Dependencies between steps are respected
- [ ] **Scope is bounded** - In-Scope and Out-of-Scope together leave no
  gray area

## Anti-Patterns

### The Wishful Plan

**Wrong:** "Step 1: Implement the feature. Step 2: Test it. Step 3: Deploy."
**Why it fails:** Zero actionable detail. Implementor must make every decision.

### The TBD Plan

**Wrong:** "Assumptions: TBD after investigation"
**Why it fails:** Violates Iron Law 1. Investigate NOW, not later.

### The Assumption Plan

**Wrong:** "The auth module probably uses JWT tokens, so we'll add a claim."
**Why it fails:** Violates Iron Law 3. Read the code and confirm.

### The Kitchen Sink Plan

**Wrong:** Including every possible improvement alongside the core task.
**Why it fails:** Unbounded scope leads to incomplete delivery.

### The Copy-Paste Plan

**Wrong:** Repeating the user's request back as a plan without investigation.
**Why it fails:** Adds no value. The user already knows what they asked for.

## Checklist Before Finishing

Run this checklist before declaring the plan complete:

- [ ] All Required Sections are present and filled with concrete content
- [ ] Zero instances of "TBD", "TODO", "figure out", or "decide later"
- [ ] Every file path in the plan has been verified to exist (or is
  explicitly marked as new file to create)
- [ ] Every function/method referenced has been confirmed by reading source
- [ ] Implementation steps are in dependency order
- [ ] Each step has a scope tag ([S], [M], or [L])
- [ ] Success criteria are binary and testable
- [ ] Verification methods exist for every success criterion
- [ ] Out-of-scope section addresses likely scope creep areas
- [ ] Assumptions include "if wrong" consequences
- [ ] Risk mitigations are specific actions, not "be careful"

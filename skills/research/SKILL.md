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

## The Iron Laws

```
NO COMPLETION CLAIMS WITHOUT TICKET ARTIFACT
```

Unless you have strictly followed the process to generate a ticket artifact, you cannot claim that the research is complete

## Process

**REQUIRED:** Use {{tool.task_tracking}} to create a task for each step.
You MUST create a task for each of these steps and complete them in order:

### Step 1: Understanding the Idea

**Ask questions to clarify what the user wants to accomplish:**

- Ask questions one at a time{{tool.ask_user}}
- Before asking{{tool.ask_user}}, you MUST **present** a question
- If a topic needs more explortion, break it into multiple questions
- Clearly specify whether the question is single-selection type or multiple-selection type to ask{{tool.ask_user}}

**Question Structure:**
```
Question: [Clear question ending with ?]
Type: [Single-selection | Multiple-selection]
Options:
  A. [Option]
  B. [Option]
  ... (up-to 4 options)
  D. [Option]
Recommendations: [MUST match Type. Single: "A" | Multiple: "A + B"]
Rationale: [Explain the reasoning behind the recommendation]
Trade-offs:
  1. [Trade-off for recommendation]
  2. [Trade-off for other options]
```

**Questions:**

1. **Problem: What problem are you solving?**
   - The underlying need, not the proposed solution
   - Why does this matter?

2. **Audience: Who is this for?**
   - End users, developers, operators?
   - What do they need?

3. **Success Criteria: What does success look like?**
   - How will you know it works?
   - What would make this valuable?

4. **Non-goals: What are we NOT doing?**
   - Explicitly out of scope for this task
   - Related problems intentionally left unaddressed
   - Future considerations deferred to later phases

5. **Risks & Constraints: What risks and constraints exist?**
   - Technical limitations
   - Time constraints
   - Compatibility requirements
   - Known risks and failure modes
   - Mitigation strategies for identified risks

6. **Exploration: What have you considered?**
   - Initial ideas or preferences
   - Approaches to avoid
   - Prior art to reference

### Step 2: Presenting Preliminary Idea

**Present a preliminary idea:**

```
**Problem:** 
- [problems]

**Audience:**
- [audiences]

**Success Criteria:**
- [success criteria]

**Non-goals:**
- [Non-goals]

**Risks:**
- [Risks]

**Risks & Constraints:**
- [Constraints]
- [Risks]
- [Mitigations]

**Explorations:**
- [Explorations]

**Assumptions:**
- [Assumptions]

**Open Questions:**
- [Open questions to ask but not important/critical]
- [Open questions to explore]
- (Add further questions at your discretion to ensure clarity)
```

**Ask the user if the preliminary idea is acceptable{{tool.ask_user}}:**
- **User approves** - proceed to Step 3
- **User rejects** - Return to step 1 based on the user's message

### Step 3: Exploring Codebase and Documentation

**Launch 2-3 `code-explorer` agents in parallel, each agent should:**
- Explore the codebase to answer open questions from preliminary idea
- Trace through the code comprehensively and focus on getting a comprehensive understanding of abstractions, architecture and flow of control
- Target a different aspect of the codebase (e.g., similar features, high level understanding, architectural understanding, user experience, etc)
- Include a list of 5-10 key files to read

**Example of `code-explorer` agent prompts:**
- "Find features similar to [feature] and trace through their implementation comprehensively"
- "Map the architecture and abstractions for [feature area], tracing through the code comprehensively"
- "Analyze the current implementation of [existing feature/area], tracing through the code comprehensively"
- "Identify UI patterns, testing approaches, or extension points relevant to [feature]"

**(WHEN NEEDED) Launch `web-explorer` agents if:**
- Understanding external libraries of APIs the code depends on
- Comparing implementation approaches or best practices
- Investigating third-party service documentation
- Researching security implications or known issues

**Once the agents return, please read all files identified by agents to build deep understanding**

**Present comprehensive summary of findings and patterns discovered:**

```
## Findings

### Relevant Files

| File            | Purpose     | Key Lines |
| --------------- | ----------- | --------- |
| path/to/file.ts | Description | 42-87     |

### Existing Patterns

[Patterns discovered that inform implementation]

### Dependencies

[External and internal dependencies]

### External Research

[Findings from web research, if conducted - include sources]

### Technical Constraints

[Limitations discovered during exploration]

## Open Questions

[Outstanding or newly identified questions from the exploration]
```

### Step 4: Asking Further Clarifying Questions

**Ask questions one at a time to resolve remaining ambiguities{{tool.ask_user}}:**
- Outstanding open questions
- Newly identified ambiguities: Problem, Audience, Success Criteria, Risks, Constraints, Mitigations, Explorations, Assumptions
- Ambiguities required to clarify before exploring approaches

**Checklist before proceeding to Step 5:**

- [ ] All open questions have been fully addressed and resolved

### Step 5: Exploring Approaches

**Launch 2-3 `code-architect` agents in parallel with different focuses:**

- **minimal changes:** smallest change, maxmium reuse
- **clean architecture:** maintainability, elegant abstractions
- **pragmatic balance:** speed + quality

**Review all approaches:**

- Form your opinion on which fits best for this specific task
- Analyze the trade-offs between approaches

**Present approaches:**

```
## Approach A: [Name]
[2-3 sentences describing the approach]

**Pros**: [Key advantages]
**Cons**: [Key disadvantages]
**Best when**: [Situations where this shines]

## Approach B: [Name]
[2-3 sentences describing the approach]

**Pros**: [Key advantages]
**Cons**: [Key disadvantages]
**Best when**: [Situations where this shines]

## Approach C: [Name] (if applicable)
...

## Recommendation
[Which approach and why, based on stated constraints]
```

**Ask user for his preferred approach{{tool.ask_user}}:**

- "Approach A (recommended)" - with brief rationale
- "Approach B" - with brief rationale
- "Explore further" - discuss more options
- "None of these" - gather more requirements

### Step 6: Documenting Ticket

**Present the Ticket:**

```
# Ticket: <Topic> (YYYY-MM-DD)

## 1. Requirements

### Problem
[problems]

### Audience
[audiences]

### Success Criteria
[success criteria]

### Non-goals
[Non-goals]

### Constraints
[Constraints]

### Risks
[Risks]

### Explorations
[Explorations]

### Assumptions
[Assumptions]

## 2. Exploration Findings

### Relevant Files

| File            | Purpose     | Key Lines |
| --------------- | ----------- | --------- |
| path/to/file.ts | Description | 42-87     |

### Existing Patterns

[Patterns discovered that inform implementation]

### Dependencies

[External and internal dependencies]

### External Research

[Findings from web research, if conducted - include sources]

### Technical Constraints

[Limitations discovered during exploration]

## 3. Design

### Chosen Architecture (Detailed architectural specifications to facilitate implementation planning)

- **Component Design**: 
   - [Each component with file path, responsibilities, dependencies, and interfaces]
   - ...
- **Implementation Map**:
   - [Specific files to create/modify with detailed change descriptions]
   - ...
- **Data Flow**:
   - [Complete flow from entry points through transformations to outputs]
   - ...
- **Build Sequence**:
   - [Phased implementation steps as a checklist]
   - ...
- **Critical Details**:
   - [Error handling, state management, testing, performance, and security considerations]
   - ...

### Alternative Architectures Considered

- Alternative 1: [2-3 sentences describing the approach]
- ...

### Decision Rationale

[Why the chosen option best satisfies constraints and requirements.]

### Architectural Decision Records (ADRs)

#### ADR 1

- Context: [Describe the background and the specific technical challenges or requirements that necessitate this decision]
- Decision: [State the chosen architecture, technology, or approach clearly]
- Alternatives Considered:
   - **Alternative 1:** [Brief description]
   - ...
- Trade-offs: (Analyze the pros and cons between the selected option and the alternatives)
   | Option | Pros | Cons |
   | :--- | :--- | :--- |
   | **Chosen ** | [Pros of chosen architecture] | [Cons of chosen architecture] |
   | **Aternative 1 ** | [Pros of Alternative 1] | [Cons of Alternative 1] |
   | ... | ... | ... |
- Consequences: (Describe the expected impact and the resulting state after this decision is implemented.)
   - **Positive:** [e.g., Improved system stability, 20% reduction in response time]
   - **Negative:** [e.g., Two weeks of additional setup time, dependency on a specific library]
- Evidence:
   - [Include data, code snippets, or research results that validate the choice]

## 9. Open Questions (if any)

- [Question]

## 10. Next Actions

- [ ] [Action]
- [ ] [Action]
```

**Ask the user if the ticket is acceptable{{tool.ask_user}}:**
- **Approve** - Save final ticket to `docs/plans/YYYY-MM-DD-<topic>-ticket.md`
- **Reject with feedback** - adjust based on feedback

## Questioning Techniques

### Funnel Questions

Start broad, narrow based on answers:

```text
1. "What are you trying to build?" (broad)
2. "Which users will interact with this?" (narrowing)
3. "What's the most important interaction?" (specific)
```

### Assumption Surfacing

Make implicit assumptions explicit:

```text
"I'm assuming this needs to integrate with the existing auth system.
Is that correct?"
```

### Trade-off Questions

When multiple valid choices exist:

```text
"There's a trade-off here:
- Option A is simpler but less flexible
- Option B is more flexible but more complex

Which matters more for this use case?"
```

### Examples for Clarity

When requirements are vague:

```text
"Can you give me an example of what you'd expect to happen
when a user does X?"
```

## YAGNI Principle

**You Aren't Gonna Need It.**

Ruthlessly apply this during research:

- Reject features "for later"
- Question every "nice to have"
- Focus on the minimum viable solution
- Complexity can be added later; removing it is hard

```text
User: "We should also add support for X in case we need it"
Response: "Let's focus on the core need first. We can add X
later if it becomes necessary. What's the minimum we need now?"
```

## Integration

- Next step for implementation planning: invoke `rpikit:writing-plans`.
- For deeper unresolved research: return to Process step 3.
- For major long-lived architectural impact:
- Optionally create `docs/adr/YYYY-MM-DD-<topic>-adr.md` and link from ticket.

## Anti-Patterns

| Wrong                                      | Right                                                 |
| ------------------------------------------ | ----------------------------------------------------- |
| Bundling multiple questions in one turn    | Ask exactly one question at a time                    |
| Prioritizing turn reduction over precision | Strictly follow "one question at a time" constraint   |
| Starting implementation immediately        | Explore codebase and get design approval first        |
| Freezing requirements based on assumptions | Use evidence from exploration to freeze design        |
| Asking open-ended questions                | Provide multiple-choice options with rationale        |
| Skipping design for "simple" tasks         | Present design and get approval for every project     |
| Claiming success without running commands  | Run the verification command before reporting results |

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

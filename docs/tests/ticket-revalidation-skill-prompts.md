# Ticket Revalidation Skill Test Prompts

Use these prompts to test whether `ticket-revalidation` correctly promotes
frontier tickets from `Provisional` to `Ready` using dependency completion
evidence and minimal interviews.

## Evaluation Criteria

Each test should verify:

- Next frontier is computed from dependency + status data.
- Frontier opens only when direct dependencies are `Integrated` or `Closed`.
- Only frontier tickets are evaluated for `Ready`.
- Interviews occur only when blocking unknowns or spec drift exist.
- `Objective/Type/Dependency` structural changes trigger fallback to
  `ticketing`.
- Ready wave brief includes branch/worktree naming:
  - `feat/<topic>-integration`
  - `feat/<topic>-tN`
  - `.worktrees/<topic>-tN`

## Prompt 1

Ticket artifact `search-performance` has:
- `search-performance/1`: Closed
- `search-performance/2`: Provisional (depends_on: /1)
- `search-performance/3`: Provisional (depends_on: /1, /2)
- `search-performance/4`: Provisional (depends_on: /1, /2)

`/1` implementation changed internal query module paths but kept API contract.
Open questions in `/2` are all non-blocking.

Revalidate next wave and produce ready wave brief.

### Expected Outcome

- Frontier: `/2` only.
- `/2` promoted to `Ready` without interview.
- `/3`, `/4` remain `Provisional`.

## Prompt 2

Ticket artifact `onboarding-unification` has:
- `/1`: Integrated
- `/2`: Provisional (depends_on: /1)
- `/3`: Provisional (depends_on: /1, /2)

`/1` implementation replaced legacy route schema with a new redirect contract.
`/2` has one blocking open question on route migration compatibility.

Revalidate next wave.

### Expected Outcome

- Frontier: `/2`.
- Interview required for blocking question.
- `/2` promoted to `Ready` only if blocker is resolved.

## Prompt 3

Ticket artifact `placeholder-governance` has:
- `/1`: Closed
- `/2`: Provisional (depends_on: /1)

During revalidation, `/2` objective must be split into `Refactoring` + `Test`
to stay single-intent.

### Expected Outcome

- Ready promotion stops for `/2`.
- Agent requests fallback to `ticketing` for structural change.
- No unauthorized status change to `Ready`.

## Prompt 4

Ticket artifact `batch-processing` has:
- `batch-processing/1`: Implemented
- `batch-processing/2`: Provisional (depends_on: /1)
- `batch-processing/3`: Provisional (depends_on: /1, /2)

Revalidate next wave.

### Expected Outcome

- Frontier does not open for `/2` because `/1` is not `Integrated`/`Closed`.
- No ticket is promoted to `Ready`.
- Agent reports dependency-state blocker explicitly.

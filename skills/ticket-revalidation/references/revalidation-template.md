# Ready Wave Brief Template

Use this template when reporting a revalidated wave.

```markdown
# Ready Wave Brief: <topic> / Wave <N>

## 1. Inputs
- Ticket artifact: `docs/tickets/<YYYY-MM-DD>-<topic>-ticket.md`
- Dependency evidence:
  - <ticket-id>: <branch/commit/test result summary>

## 2. Candidate Frontier
- <topic>/2
- <topic>/3

## 3. Revalidation Results

| Ticket | Previous Status | New Status | Interview Needed | Notes |
|--------|------------------|-----------|------------------|-------|
| <topic>/2 | Provisional | Ready | No | Drift not observed |
| <topic>/3 | Provisional | Provisional | Yes | Blocking question unresolved |

## 4. Ready Tickets Execution Handoff

| Ticket | Branch | Worktree | Preconditions |
|--------|--------|----------|---------------|
| <topic>/2 | `feat/<topic>-t2` | `.worktrees/<topic>-t2` | Base on `feat/<topic>-integration` |

Integration branch: `feat/<topic>-integration`

## 5. Blocking Items
- <topic>/3: <blocking question>
```

---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification
---

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

**Core principle:** Single directory policy + safety verification = reliable isolation.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Directory Policy

Always use `.worktrees/` at the repository root.

Do not use:
- `worktrees/`
- `~/.worktrees/...`
- directory preferences from `{{tool.project_config}}`

## Safety Verification

**MUST verify `.worktrees/` is ignored before creating worktree:**

```bash
git check-ignore -q .worktrees
```

**If NOT ignored:**

1. Ask the user one question{{tool.ask_user}}:

```text
`.worktrees/` is not ignored yet. Where should I add it?

1. `.git/info/exclude` (local-only, not committed)
2. `.gitignore` (shared, committed)

Which should I use?
```

2. Add `.worktrees/` based on the user's choice.

If user chooses `.git/info/exclude`:

```bash
touch .git/info/exclude
grep -qxF ".worktrees/" .git/info/exclude || printf ".worktrees/\n" >> .git/info/exclude
```

If user chooses `.gitignore`:

```bash
touch .gitignore
grep -qxF ".worktrees/" .gitignore || printf ".worktrees/\n" >> .gitignore
git add .gitignore
git commit -m "chore: ignore .worktrees directory"
```

3. Re-verify (required):

```bash
git check-ignore -q .worktrees
```

If re-verification fails, stop and report before creating any worktree.

**Why critical:** Prevents accidentally committing worktree contents to repository.

## Creation Steps

### 1. Prepare Directory and Path

```bash
mkdir -p .worktrees
path=".worktrees/$BRANCH_NAME"
```

### 2. Create Worktree

```bash
# Create worktree with new branch
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

### 3. Run Project Setup

Auto-detect and run appropriate setup:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 4. Verify Clean Baseline

Run tests to ensure worktree starts clean:

```bash
# Examples - use project-appropriate command
npm test
cargo test
pytest
go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or investigate.

**If tests pass:** Report ready.

### 5. Report Location

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Start worktree setup | Use `.worktrees/` only |
| `.worktrees/` not ignored | Ask user{{tool.ask_user}}: `.git/info/exclude` vs `.gitignore` |
| User chose `.git/info/exclude` | Add line there, then re-verify |
| User chose `.gitignore` | Add line + commit, then re-verify |
| Tests fail during baseline | Report failures + ask |
| No package.json/Cargo.toml | Skip dependency install |

## Common Mistakes

### Skipping ignore verification

- **Problem:** Worktree contents get tracked, pollute git status
- **Fix:** Always run `git check-ignore -q .worktrees` before creating worktree

### Using unsupported directory locations

- **Problem:** Creates inconsistency, violates project conventions
- **Fix:** Always create worktrees under `.worktrees/` only

### Proceeding with failing tests

- **Problem:** Can't distinguish new bugs from pre-existing issues
- **Fix:** Report failures, get explicit permission to proceed

### Hardcoding setup commands

- **Problem:** Breaks on projects using different tools
- **Fix:** Auto-detect from project files (package.json, etc.)

## Example Workflow

```
You: I'm using the using-git-worktrees skill to set up an isolated workspace.

[Run git check-ignore -q .worktrees - not ignored]
[Ask user: add to .git/info/exclude or .gitignore]
[User chose .gitignore]
[Add .worktrees/ to .gitignore and commit]
[Re-verify: git check-ignore -q .worktrees]
[Create worktree: git worktree add .worktrees/auth -b feature/auth]
[Run npm install]
[Run npm test - 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

## Red Flags

**Never:**
- Create worktree without verifying `.worktrees/` is ignored
- Skip baseline test verification
- Proceed with failing tests without asking
- Use `worktrees/` or `~/.worktrees/...`
- Skip re-verification after adding ignore rule

**Always:**
- Use `.worktrees/` as the only worktree location
- Verify `.worktrees/` ignore status before creation
- Ask user{{tool.ask_user}} where to add ignore rule when missing
- Re-verify ignore status after adding the rule
- Auto-detect and run project setup
- Verify clean test baseline

## Integration

**Called by:**
- **brainstorming** (Phase 4) - REQUIRED when design is approved and implementation follows
- **subagent-driven-development** - REQUIRED before executing any tasks
- **executing-plans** - REQUIRED before executing any tasks
- Any skill needing isolated workspace

**Pairs with:**
- **finishing-a-development-branch** - REQUIRED for cleanup after work complete

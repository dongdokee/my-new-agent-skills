---
name: using-git-worktrees
description: Use when preparing an isolated implementation workspace in the same repository, especially before executing approved plans or feature tasks. Enforces `.worktrees/` single-location policy, mandatory ignore verification, collision-safe `git worktree add` flow, and clean-baseline setup/test checks before coding.
---

# Using Git Worktrees

## Core Contract

- Use `.worktrees/` at repository root as the only worktree location.
- Never use `worktrees/`, `~/.worktrees/...`, or directory hints from `{{tool.project_config}}`.
- Run `git check-ignore -q .worktrees` before creating any worktree.
- If ignore verification cannot pass, stop and report before any `git worktree add`.

## Operational Checklist

### 1) Verify ignore status

```bash
git check-ignore -q .worktrees
```

### 2) If not ignored, ask once and apply

Ask the user one question{{tool.ask_user}}:

```text
`.worktrees/` is not ignored yet. Where should I add it?

1. `.git/info/exclude` (local-only, not committed)
2. `.gitignore` (shared, committed)

Which should I use?
```

If user chooses `.git/info/exclude`:

```bash
touch .git/info/exclude
grep -qxF ".worktrees/" .git/info/exclude || printf ".worktrees/\n" >> .git/info/exclude
```

If user chooses `.gitignore`:

```bash
touch .gitignore
grep -qxF ".worktrees/" .gitignore || printf ".worktrees/\n" >> .gitignore
```

Re-verify:

```bash
git check-ignore -q .worktrees
```

If re-verification fails, stop and report. Do not create a worktree.

### 3) Prepare target path

```bash
mkdir -p .worktrees
path=".worktrees/$BRANCH_NAME"
```

### 4) Resolve collisions and create worktree

Check branch/path first:

```bash
branch_exists=0
path_exists=0

git show-ref --verify --quiet "refs/heads/$BRANCH_NAME" && branch_exists=1
[ -e "$path" ] && path_exists=1
```

If `path_exists=1`, ask how to proceed before continuing:

- reuse existing path
- choose a different `path`
- remove existing path and recreate

If user chooses `reuse existing path`, do not run `git worktree add`. Re-enter and verify:

```bash
cd "$path"
current_branch="$(git branch --show-current)"
[ "$current_branch" = "$BRANCH_NAME" ] || {
  echo "Existing path is on '$current_branch', expected '$BRANCH_NAME'."
  exit 1
}
```

If user chooses `choose a different path`, update `path` and re-check:

```bash
path=".worktrees/$NEW_PATH_NAME"
[ -e "$path" ] && echo "Path already exists; ask again." && exit 1
```

If user chooses `remove existing path and recreate`, require explicit approval before deletion, then create.

Create new worktree when reuse is not selected:

```bash
if [ "$branch_exists" -eq 1 ]; then
  git worktree add "$path" "$BRANCH_NAME"
  cd "$path"
else
  git worktree add "$path" -b "$BRANCH_NAME"
  cd "$path"
fi
```

### 5) Run project setup

Run the setup command that matches the project stack.
The commands below are language-specific examples. Do not run all lines sequentially.

```bash
# Node.js
npm install

# Rust
cargo build

# Python (pip)
pip install -r requirements.txt

# Python (poetry)
poetry install

# Go
go mod download
```

### 6) Verify clean baseline

- Run the project's standard test command first.
- If standard command is unclear, ask for one baseline command{{tool.ask_user}}.
- If tests fail, summarize failures and ask whether to stop, investigate, or continue with explicit approval.

### 7) Report ready status

```text
Worktree ready at <full-path>
Baseline check: <command> -> <result>
Ready to implement <feature-name>
```

## Failure Handling

- Ignore check fails after remediation: stop immediately and report blocker.
- Worktree path collision unresolved: do not create worktree until user chooses resolution.
- Reused path is not a valid target branch: report mismatch and ask whether to retarget or recreate.
- Setup command fails: report command + error summary, then ask whether to debug or proceed.
- Baseline test fails: do not assume clean state; ask for explicit direction.
- `.gitignore` path chosen: adding ignore line is enough by default. Commit only if user explicitly requests it.

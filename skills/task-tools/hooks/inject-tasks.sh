#!/usr/bin/env bash
# inject-tasks.sh — BeforeModel hook: injects current session's task list
#
# Output: {"hookSpecificOutput": {"hookEventName": "BeforeAgent", "additionalContext": "..."}}
# Gemini CLI reads the additionalContext and prepends it to the model context.

# Read stdin JSON and extract session_id (jq → python3 → grep fallback)
_stdin=$(cat)
if command -v jq &>/dev/null; then
    SESSION_ID=$(printf '%s' "$_stdin" | jq -r '.session_id // empty')
elif command -v python3 &>/dev/null; then
    SESSION_ID=$(printf '%s' "$_stdin" | python3 -c 'import sys,json; print(json.loads(sys.stdin.read()).get("session_id",""))')
else
    SESSION_ID=$(printf '%s' "$_stdin" | grep -oP '"session_id"\s*:\s*"\K[^"]+' || true)
fi
SESSION_ID="${SESSION_ID:-default}"

TASKS_DIR="${HOME}/.gemini/tasks"
TASKS_FILE="${TASKS_DIR}/${SESSION_ID}.md"

_empty() { printf '{}'; exit 0; }

[[ ! -f "$TASKS_FILE" ]] && _empty

# Check for at least one non-deleted task section
task_count=$(awk '/^## #/{count++} END{print count+0}' "$TASKS_FILE")
[[ "$task_count" -eq 0 ]] && _empty

# Build summary rows (skip deleted tasks) — TaskList style
rows=$(awk '
    /^## #/ {
        if (id != "" && status != "deleted") {
            line = "> #" id " [" status "] " subject
            if (blockedby != "[]" && blockedby != "") line = line " (blocked by " blockedby ")"
            print line
        }
        id = substr($0, 5)
        subject = ""; status = "pending"; blockedby = "[]"; blocks = "[]"
        next
    }
    id != "" && /^subject: /   { subject   = substr($0, 10) }
    id != "" && /^status: /    { status    = substr($0,  9) }
    id != "" && /^blockedby: / { blockedby = substr($0, 12) }
    id != "" && /^blocks: /    { blocks    = substr($0,  9) }
    END {
        if (id != "" && status != "deleted") {
            line = "> #" id " [" status "] " subject
            if (blockedby != "[]" && blockedby != "") line = line " (blocked by " blockedby ")"
            print line
        }
    }
' "$TASKS_FILE")

[[ -z "$rows" ]] && _empty

# Build markdown content
content="## Current Tasks

> Tasks:
${rows}

**Task Management**: Run \`bash .gemini/hooks/task-manager.sh --session ${SESSION_ID} <subcommand>\` to manage tasks.
Current session: \`${SESSION_ID}\`
Aliases: \`start <id>\` (in_progress), \`done <id>\` (completed), \`delete <id>\` (removed).
**Lifecycle rule:** Call \`start <id>\` before beginning each task; call \`done <id>\` only after it completes. Never call \`done\` on a pending task.

**REQUIRED**: Start every response with a task status summary:
> Tasks:
> #1 [completed] Fix type errors in src/auth/
> #2 [in_progress] Add auth module
> #3 [pending] Write tests (blocked by [1, 2])
Omit completed tasks after the first response."

# JSON-encode the content string (jq → python3 → pure bash fallback)
if command -v jq &>/dev/null; then
    json_val=$(printf '%s' "$content" | jq -Rs .)
elif command -v python3 &>/dev/null; then
    json_val=$(printf '%s' "$content" | python3 -c 'import sys, json; print(json.dumps(sys.stdin.read()))')
else
    # Pure bash JSON escaping
    escaped="${content//\\/\\\\}"
    escaped="${escaped//\"/\\\"}"
    escaped="${escaped//$'\n'/\\n}"
    escaped="${escaped//$'\t'/\\t}"
    json_val="\"${escaped}\""
fi

printf '{"hookSpecificOutput": {"hookEventName": "BeforeAgent", "additionalContext": %s}}' "$json_val"

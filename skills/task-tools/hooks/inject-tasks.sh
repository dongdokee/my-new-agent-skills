#!/usr/bin/env bash
# inject-tasks.sh — BeforeModel hook: injects current session's task list
#
# Output: {"content": "<markdown>"} or {"content": ""}
# Gemini CLI reads the "content" field and prepends it to the model context.

TASKS_FILE="${GEMINI_PROJECT_DIR:-$(pwd)}/.tasks/${GEMINI_SESSION_ID:-default}.md"

_empty() { printf '{"content": ""}'; exit 0; }

[[ ! -f "$TASKS_FILE" ]] && _empty

# Check for at least one non-deleted task section
task_count=$(awk '/^## #/{count++} END{print count+0}' "$TASKS_FILE")
[[ "$task_count" -eq 0 ]] && _empty

# Build table rows (skip deleted tasks)
rows=$(awk '
    /^## #/ {
        if (id != "" && status != "deleted") {
            print "| " id " | " subject " | " status " | " blockedby " | " blocks " |"
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
            print "| " id " | " subject " | " status " | " blockedby " | " blocks " |"
        }
    }
' "$TASKS_FILE")

[[ -z "$rows" ]] && _empty

# Build markdown content
content=$(printf '%s\n%s\n%s\n%s\n\n%s' \
    "## Current Tasks" \
    "" \
    "| ID | Subject | Status | BlockedBy | Blocks |" \
    "|----|---------|--------|-----------|--------|" \
    "$rows")

content="${content}

**Task Management**: Run \`bash .gemini/hooks/task-manager.sh <subcommand>\` to manage tasks.
Aliases: \`start <id>\` (→ in_progress), \`done <id>\` (→ completed), \`delete <id>\` (→ removed).
**Lifecycle rule:** Call \`start <id>\` before beginning each task; call \`done <id>\` only after it completes. Never call \`done\` on a pending task.

**REQUIRED**: Start every response with a one-line task status summary:
> Tasks: #1 ✅ #2 🔄 Asking clarifying questions #3–6 ⏳

Use ✅ completed, 🔄 in_progress, ⏳ pending. Omit completed tasks after the first response."

# JSON-encode the content string
if command -v jq &>/dev/null; then
    json_val=$(printf '%s' "$content" | jq -Rs .)
else
    json_val=$(printf '%s' "$content" | python3 -c 'import sys, json; print(json.dumps(sys.stdin.read()))')
fi

printf '{"content": %s}' "$json_val"

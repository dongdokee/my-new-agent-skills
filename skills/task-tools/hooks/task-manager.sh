#!/usr/bin/env bash
# task-manager.sh — Session-based task CRUD
#
# Usage: task-manager.sh [--session <id>] <subcommand> [args...]
#
# Subcommands:
#   create "<subject>" "<description>" "<activeform>" "<blockedby>" "<blocks>"
#   get <id>
#   list [status]
#   start <id>                         (alias for update <id> in_progress)
#   done <id>                          (alias for update <id> completed)
#   delete <id>                        (alias for update <id> deleted)
#   update <id> [field=]value [field=value ...]
#   output <id> [--wait]
#   stop <id|pid>

set -euo pipefail

# Parse --session flag
SESSION_ID="default"
if [[ "${1:-}" == "--session" ]]; then
    SESSION_ID="${2:-default}"
    shift 2
fi

TASKS_DIR="${HOME}/.gemini/tasks"
TASKS_FILE="${TASKS_DIR}/${SESSION_ID}.md"

_ensure_file() {
    if [[ ! -f "$TASKS_FILE" ]]; then
        mkdir -p "$TASKS_DIR"
        printf '# Tasks\n' > "$TASKS_FILE"
    fi
}

_next_id() {
    if [[ ! -f "$TASKS_FILE" ]]; then
        echo 1
        return
    fi
    local max
    max=$(grep -oP '(?<=^## #)\d+' "$TASKS_FILE" 2>/dev/null | sort -n | tail -1 || true)
    echo $((${max:-0} + 1))
}

_get_section() {
    local id="$1"
    awk -v id="$id" '
        /^## #/ { found = ($0 == "## #"id); next }
        found && /^## #/ { exit }
        found { print }
    ' "$TASKS_FILE"
}

# ---------------------------------------------------------------------------
# create "<subject>" "<description>" "<activeform>" "<blockedby>" "<blocks>"
# ---------------------------------------------------------------------------
cmd_create() {
    local subject="${1:-}"
    local description="${2:-}"
    local activeform="${3:-}"
    local blockedby="${4:-[]}"
    local blocks="${5:-[]}"

    if [[ -z "$subject" ]]; then
        echo "Error: subject is required" >&2
        exit 1
    fi
    [[ -z "$activeform" ]] && activeform="$subject"

    _ensure_file
    local id
    id=$(_next_id)

    printf '\n## #%s\nsubject: %s\nstatus: pending\ndescription: %s\nactiveform: %s\nblockedby: %s\nblocks: %s\n' \
        "$id" "$subject" "$description" "$activeform" "$blockedby" "$blocks" >> "$TASKS_FILE"

    echo "Task created: #${id} — ${subject}"
    echo "Status: pending"
}

# ---------------------------------------------------------------------------
# get <id>
# ---------------------------------------------------------------------------
cmd_get() {
    local id="${1:-}"
    if [[ -z "$id" ]]; then
        echo "Error: task ID required" >&2; exit 1
    fi
    if [[ ! -f "$TASKS_FILE" ]]; then
        echo "No tasks file found." >&2; exit 1
    fi

    local content
    content=$(_get_section "$id")
    if [[ -z "$content" ]]; then
        echo "Task #${id} not found." >&2; exit 1
    fi

    echo "Task #${id}"
    echo "──────────────────────────"
    echo "$content"
}

# ---------------------------------------------------------------------------
# list [status]
# ---------------------------------------------------------------------------
cmd_list() {
    local filter="${1:-}"

    if [[ ! -f "$TASKS_FILE" ]]; then
        echo "No tasks yet."
        return
    fi

    local has_tasks=0
    for status_key in "in_progress:## In Progress" "pending:## Pending" "completed:## Completed"; do
        local st="${status_key%%:*}"
        local label="${status_key#*:}"

        if [[ -n "$filter" && "$filter" != "$st" ]]; then
            continue
        fi

        local rows
        rows=$(awk -v target="$st" '
            /^## #/ {
                if (id != "" && status == target) print "  #"id"  "subject
                id = substr($0, 5); subject = ""; status = "pending"
                next
            }
            id != "" && /^subject: /  { subject = substr($0, 10) }
            id != "" && /^status: /   { status  = substr($0,  9) }
            END {
                if (id != "" && status == target) print "  #"id"  "subject
            }
        ' "$TASKS_FILE")

        if [[ -n "$rows" ]]; then
            echo "$label"
            echo "$rows"
            echo ""
            has_tasks=1
        fi
    done

    if [[ $has_tasks -eq 0 && -z "$filter" ]]; then
        echo "No tasks yet."
        return
    fi

    # Summary counts via awk to avoid grep -c exit-1 on zero matches
    local stats
    stats=$(awk '
        /^## #/ { total++ }
        /^status: in_progress/ { ip++ }
        /^status: pending/     { p++ }
        /^status: completed/   { c++ }
        END { print (total+0)" "(ip+0)" "(p+0)" "(c+0) }
    ' "$TASKS_FILE")
    read -r total ip p c <<< "$stats"
    echo "Total: ${total} tasks (${ip} in_progress, ${p} pending, ${c} completed)"
}

# ---------------------------------------------------------------------------
# update <id> [field=]value [field=value ...]
# ---------------------------------------------------------------------------
cmd_update() {
    local id="${1:-}"
    shift || true

    if [[ -z "$id" ]]; then
        echo "Error: task ID required" >&2; exit 1
    fi
    if [[ ! -f "$TASKS_FILE" ]]; then
        echo "Task file not found." >&2; exit 1
    fi

    local content
    content=$(_get_section "$id")
    if [[ -z "$content" ]]; then
        echo "Task #${id} not found." >&2; exit 1
    fi

    local current_status
    current_status=$(echo "$content" | awk '/^status: / { print substr($0,9); exit }')

    local tmp
    tmp=$(mktemp)
    cp "$TASKS_FILE" "$tmp"

    local changed=0
    for pair in "$@"; do
        local field value
        if [[ "$pair" == *=* ]]; then
            field="${pair%%=*}"
            value="${pair#*=}"
        else
            # Shorthand: if it matches a valid status, treat as status=value
            local valid_statuses="pending in_progress completed deleted"
            if [[ " $valid_statuses " == *" $pair "* ]]; then
                field="status"
                value="$pair"
            else
                echo "Error: expected field=value or a valid status, got: '$pair'" >&2
                rm -f "$tmp"
                exit 1
            fi
        fi

        if [[ "$field" == "status" && "$value" == "completed" && "$current_status" == "pending" ]]; then
            echo "Error: Task #${id} is still pending. Call \`start ${id}\` first." >&2
            rm -f "$tmp"
            exit 1
        fi

        if [[ "$field" == "status" && "$value" == "deleted" ]]; then
            # Remove entire section
            awk -v id="$id" '
                BEGIN { skip = 0 }
                /^## #/ { skip = ($0 == "## #"id) }
                !skip { print }
            ' "$tmp" > "${tmp}.new"
            mv "${tmp}.new" "$tmp"
            echo "Task #${id} deleted."
            cp "$tmp" "$TASKS_FILE"
            rm -f "$tmp"
            return
        fi

        # Update field within the section
        awk -v id="$id" -v field="$field" -v value="$value" '
            /^## #/ { in_task = ($0 == "## #"id) }
            in_task && $0 ~ ("^"field": ") { print field": "value; next }
            { print }
        ' "$tmp" > "${tmp}.new"
        mv "${tmp}.new" "$tmp"
        changed=1
    done

    if [[ $changed -eq 1 ]]; then
        cp "$tmp" "$TASKS_FILE"
        echo "Task #${id} updated."
    fi
    rm -f "$tmp"
}

# ---------------------------------------------------------------------------
# output <id> [--wait]
# ---------------------------------------------------------------------------
cmd_output() {
    local id="${1:-}"
    local wait_flag="${2:-}"

    if [[ -z "$id" ]]; then
        echo "Error: task ID required" >&2; exit 1
    fi

    local output_file="/tmp/tasks/${id}.output"

    if [[ "$wait_flag" == "--wait" ]]; then
        local pid_file="/tmp/tasks/${id}.pid"
        if [[ -f "$pid_file" ]]; then
            local pid
            pid=$(cat "$pid_file")
            tail --pid="$pid" -f "$output_file" 2>/dev/null || true
        else
            while [[ ! -f "/tmp/tasks/${id}.done" ]]; do sleep 1; done
        fi
    fi

    if [[ ! -f "$output_file" ]]; then
        echo "${output_file} not found."
        echo "The process may not have started yet, or it may be writing to a different path."
        return
    fi

    local lines
    lines=$(wc -l < "$output_file")
    if [[ "$lines" -gt 50 ]]; then
        echo "Task #${id} output (${lines} lines total, showing last 50):"
        echo "──────────────────────────"
        tail -50 "$output_file"
    else
        echo "Task #${id} output:"
        echo "──────────────────────────"
        cat "$output_file"
    fi
}

# ---------------------------------------------------------------------------
# stop <id|pid>
# ---------------------------------------------------------------------------
cmd_stop() {
    local id_or_pid="${1:-}"

    if [[ -z "$id_or_pid" ]]; then
        echo "Error: task ID or PID required" >&2; exit 1
    fi

    local pid
    local pid_file="/tmp/tasks/${id_or_pid}.pid"
    if [[ -f "$pid_file" ]]; then
        pid=$(cat "$pid_file")
    else
        pid="$id_or_pid"
    fi

    if ! kill -0 "$pid" 2>/dev/null; then
        echo "PID ${pid} is not running."
        return
    fi

    kill "$pid"

    local waited=0
    while kill -0 "$pid" 2>/dev/null && [[ $waited -lt 5 ]]; do
        sleep 1
        ((waited++)) || true
    done

    if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid"
    fi

    echo "Stopped PID ${pid}."
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------
case "${1:-}" in
    create) shift; cmd_create "$@" ;;
    get)    shift; cmd_get    "$@" ;;
    list)   shift; cmd_list   "$@" ;;
    start)  shift; cmd_update "${1:-}" "in_progress" ;;
    done)   shift; cmd_update "${1:-}" "completed" ;;
    delete) shift; cmd_update "${1:-}" "deleted" ;;
    update) shift; cmd_update "$@" ;;
    output) shift; cmd_output "$@" ;;
    stop)   shift; cmd_stop   "$@" ;;
    *)
        echo "Usage: task-manager.sh [--session <id>] <create|get|list|start|done|delete|update|output|stop> [args...]" >&2
        exit 1
        ;;
esac

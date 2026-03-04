# Ticket: Evaluate reciting-task-state skill (2026-03-03)

**Git HEAD:** 523d080f1380c6c916c07a67fa06de289c3b5795

## 1. Requirements

### Problem
Ensuring session continuity and preventing task drift in long AI agent sessions. The current monolithic file-based tracking is prone to data corruption and context bloat as sessions grow.

### Audience
AI Agent developers who need reliable, token-efficient task state management that survives context compression and session interruptions.

### Success Criteria
A new design that improves accuracy and token efficiency by transitioning from a single monolithic file to a more robust, directory-based state machine.

### Non-goals
- Implementing code changes to the skill itself during this research phase.
- Evaluating the skill's performance on platforms other than Gemini CLI.

### Constraints
- The solution must work in environments where no native task-tracking API is available.
- The solution must leverage existing platform tools (`read_file`, `write_file`, `list_directory`, `run_shell_command`).
- The state must be stored in the project's temporary directory to avoid repository pollution.

### Risks
- Increased complexity in initial setup for the agent.
- Potential for session state loss if the transition between tasks is interrupted.

### Explorations
- Evaluated three approaches: Minimal Change (pruning), Clean Architecture (file-system state machine), and Pragmatic Balance (lazy-sync).
- Compared with prior art like Todo.txt and standard file-based state management.

### Assumptions
- The agent has full access to file system tools in the temporary directory.
- The agent can reliably execute shell commands for atomic file moves (`mv`).

## 2. Exploration Findings

### Relevant Files

| File | Purpose | Key Lines |
| --------------- | ----------- | --------- |
| `skills/reciting-task-state/SKILL.md` | Core instructions, format rules, and process for task tracking. | 1-120 |
| `skills/reciting-task-state/skill.yaml` | Manifest defining the skill's name and platform (Gemini). | 1-8 |
| `docs/eval-skills/eval-skills.md` | Project-wide guide for systematic skill evaluation. | 1-150 |

### Existing Patterns
- **Monolithic File Rewrite:** The current skill reads and rewrites a single `todo.md` on every change, which is prone to errors as the file grows.
- **Strict Turn-Start Read:** Mandates a full read at the beginning of every turn, which is token-intensive if the file is large.
- **Append-Only History:** Keeps all completed tasks in the file, leading to context bloat.

### Dependencies
- **Platform Tools:** `read_file`, `write_file`, `list_directory`.

### Technical Constraints
- File path must be `<project-tmp-dir>/<session-uuid>/todo.md`.

## 3. Design

### Chosen Architecture (Directory-Based State Machine)

The chosen architecture transitions from a single monolithic file to a directory-based structure where each task is its own file.

- **Component Design**:
   - **`tasks/pending/`**: Directory for tasks waiting to be started.
   - **`tasks/current/`**: Directory for the single active task (limit 1 file).
   - **`tasks/done/`**: Directory for completed tasks.
   - **Task Files**: Each file (e.g., `01-setup.md`) contains specific notes, sub-tasks, and details for that task.
- **Implementation Map**:
   - **Modify `SKILL.md`**: Update the "Setup" and "Process" sections to use the new directory structure.
   - **New Commands**: Incorporate `mkdir -p tasks/{pending,current,done}` and `mv tasks/pending/X tasks/current/X`.
   - **Update Rules**: Add a rule restricting `tasks/current/` to exactly one file.
- **Data Flow**:
   1. **Init**: Create directory structure and initial task files in `pending/`.
   2. **Transition**: Move the next task file from `pending/` to `current/`.
   3. **Execution**: Read and update the file in `current/` for active work.
   4. **Completion**: Move the active task file from `current/` to `done/`.
- **Build Sequence**:
   - [ ] [Phase 1] Rewrite `SKILL.md` to document the new rules.
   - [ ] [Phase 2] Update skill-local sub-agents to follow the new state machine.
   - [ ] [Phase 3] Add validation logic to the installer to check for correct setup.
- **Critical Details**:
   - **Accuracy**: Atomic moves ensure that state transitions are reliable and cannot mangle unrelated tasks.
   - **Efficiency**: The agent only reads the active task's file, reducing token consumption.

### Alternative Architectures Considered

- **Alternative 1 (Minimal Change)**: prunes completed tasks from the monolithic file. It is simpler but doesn't solve the risk of file mangling during rewrites.
- **Alternative 2 (Lazy-Sync)**: reduces I/O frequency. It's faster but risks state loss if the context is truncated before synchronization.

### Decision Rationale
Approach B (File-System State Machine) was chosen because it provides the highest degree of reliability and accuracy. By decoupling tasks into individual files and using the file system's atomic operations, we eliminate the primary failure mode of the current skill while also improving token efficiency.

### Architectural Decision Records (ADRs)

#### ADR 1: Directory-Based State Machine

- **Context:** Monolithic file rewrites by an LLM are prone to "lost-in-the-middle" effects and formatting errors as the session length increases.
- **Decision:** Use a directory structure (`pending/`, `current/`, `done/`) and individual task files instead of a single ledger.
- **Alternatives Considered:**
   - **Alternative 1:** Monolithic file with pruning.
   - **Alternative 2:** Lazy-sync to a central file.
- **Trade-offs:**
   | Option | Pros | Cons |
   | :--- | :--- | :--- |
   | **Chosen (Approach B)** | 100% resilience, atomic moves, token efficiency. | More complex setup, requires more file system calls. |
   | **Alternative 1** | Simple to implement, good token efficiency. | Still vulnerable to file mangling during rewrites. |
   | **Alternative 2** | High speed, reduced I/O overhead. | Risk of "amnesia" if context is lost before syncing. |
- **Consequences:**
   - **Positive:** Absolute state reliability, easier debugging, better token management.
   - **Negative:** Slightly more complex for the agent to initialize and navigate.
- **Evidence:** Analysis of `SKILL.md` and research on LLM context attention patterns confirms the risks of monolithic state files.

## 4. Open Questions

- Should we include a separate directory for `blocked/` or `paused/` tasks?
- How should the agent handle task priority within the directory structure?

## 5. Next Actions

- [ ] Save the ticket to `docs/plans/2026-03-03-reciting-task-state-evaluation.md`.
- [ ] Create a detailed implementation plan if requested.

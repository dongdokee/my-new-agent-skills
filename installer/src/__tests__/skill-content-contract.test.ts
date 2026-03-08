import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../../..");

function read(pathFromRoot: string): string {
  return readFileSync(resolve(ROOT, pathFromRoot), "utf-8");
}

describe("skill content contracts", () => {
  it("brainstorming enforces hard gate and writing-plans handoff", () => {
    const body = read("skills/brainstorming/SKILL.md");
    expect(body).toContain("<HARD-GATE>");
    expect(body).toContain("Do NOT invoke any implementation skill");
    expect(body).toContain("{{tool.task_tracking}}");
    expect(body).toContain("The ONLY skill you invoke after brainstorming is writing-plans");
  });

  it("auditing-behaviors defines ssot target and boundary entry-point format", () => {
    const body = read("skills/auditing-behaviors/SKILL.md");
    expect(body).toContain("docs/behavior-contract.md");
    expect(body).toContain("Story `Entry Points` value format:");
    expect(body).toContain("At most 3 subagents may run at the same time.");
    expect(body).toContain("Status values:");
    expect(body).toContain("`Insufficient evidence`");
  });

  it("reciting-task-state enforces temp-path-only todo tracking", () => {
    const body = read("skills/reciting-task-state/SKILL.md");
    expect(body).toContain("<project-tmp-dir>/<session-uuid>/todo.md");
    expect(body).toContain("Never write `todo.md` inside the project repository.");
    expect(body).toContain("Exactly one task may be marked `[~]`");
  });

  it("using-superpowers stays platform-neutral with placeholders", () => {
    const body = read("skills/using-superpowers/SKILL.md");
    expect(body).toContain("{{tool.enter_plan_mode}}");
    expect(body).toContain("{{tool.skill_activation}}");
    expect(body).toContain("{{tool.task_tracking}}");
    expect(body).not.toMatch(/\bEnterPlanMode\b/);
    expect(body).not.toContain("Skill tool");
    expect(body).not.toContain("TodoWrite");
  });

  it("receiving-code-review stays platform-neutral for project config naming", () => {
    const body = read("skills/receiving-code-review/SKILL.md");
    expect(body).toContain("{{tool.project_config}}");
    expect(body).not.toContain("CLAUDE.md");
  });

  it("subagent dispatch skills stay platform-neutral for dispatch tool naming", () => {
    const dispatchBody = read("skills/dispatching-parallel-agents/SKILL.md");
    expect(dispatchBody).toContain("{{tool.subagent_dispatch_parallel}}");
    expect(dispatchBody).not.toMatch(/\bTask\(/);

    const reviewBody = read("skills/requesting-code-review/SKILL.md");
    expect(reviewBody).toContain("{{tool.subagent_dispatch_code_review}}");
    expect(reviewBody).not.toContain("Use Task tool with code-reviewer type");
  });
});

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
});

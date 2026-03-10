import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../../..");

function read(pathFromRoot: string): string {
  return readFileSync(resolve(ROOT, pathFromRoot), "utf-8");
}

function listBundledSkillFiles(dir: string, root: string = dir): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) return listBundledSkillFiles(fullPath, root);
      const relativePath = fullPath.slice(root.length + 1);
      if (relativePath === "skill.yaml" || relativePath === "SKILL.md") return [];
      return [relativePath];
    })
    .sort();
}

describe("skill content contracts", () => {
  it("brainstorming enforces hard gate and writing-plans handoff", () => {
    const body = read("skills/brainstorming/SKILL.md");
    expect(body).toContain("<HARD-GATE>");
    expect(body).toContain("Do NOT invoke any implementation skill");
    expect(body).toContain("{{tool.task_tracking}}");
    expect(body).toContain("The ONLY skill you invoke after brainstorming is writing-plans");
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

  it("bundled skill files do not contain unresolved tool placeholders", () => {
    const skillsRoot = resolve(ROOT, "skills");

    for (const skillDirEntry of readdirSync(skillsRoot, { withFileTypes: true })) {
      if (!skillDirEntry.isDirectory()) continue;
      const skillDir = resolve(skillsRoot, skillDirEntry.name);

      for (const relativePath of listBundledSkillFiles(skillDir)) {
        const body = readFileSync(resolve(skillDir, relativePath), "utf-8");
        expect(body, `${skillDirEntry.name}/${relativePath}`).not.toContain("{{tool.");
      }
    }
  });
});

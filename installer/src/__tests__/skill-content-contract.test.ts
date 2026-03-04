import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../../..");

function read(pathFromRoot: string): string {
  return readFileSync(resolve(ROOT, pathFromRoot), "utf-8");
}

describe("skill content contracts", () => {
  it("ticket-revalidation uses strict dependency gate wording", () => {
    const body = read("skills/ticket-revalidation/SKILL.md");
    expect(body).toContain("`Integrated` or `Closed`");
    expect(body).not.toMatch(/implemented or\s+integrated/i);
  });

  it("finishing-ticket-implementation defines deterministic merge rollback flow", () => {
    const body = read("skills/finishing-ticket-implementation/SKILL.md");
    expect(body).toContain("git merge --no-ff --no-edit");
    expect(body).toContain("git merge --abort");
    expect(body).toContain("git revert --no-edit -m 1 HEAD");
    expect(body).toContain("Never use `git reset --hard`");
  });

  it("ticketing declares spec detail level model", () => {
    const body = read("skills/ticketing/SKILL.md");
    expect(body).toContain("`Spec Detail Level`");
    expect(body).toContain("Wave 1 tickets: `Full`");
    expect(body).toContain("Wave 2+ tickets: `Lean`");
    expect(body).toContain("This skill only writes `Provisional`.");
  });

  it("ticket template includes detail-level fields", () => {
    const body = read("skills/ticketing/references/ticket-template.md");
    expect(body).toContain("Spec Detail Level");
    expect(body).toContain("Lean Fields (only for Lean)");
  });
});

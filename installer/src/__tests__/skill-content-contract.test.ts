import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../../..");

function read(pathFromRoot: string): string {
  return readFileSync(resolve(ROOT, pathFromRoot), "utf-8");
}

describe("skill content contracts", () => {
  it("capturing-intent-before-researching enforces baseline taxonomy and explicit-only decomposition", () => {
    const body = read("skills/capturing-intent-before-researching/SKILL.md");
    expect(body).toContain("`Feature`");
    expect(body).toContain("`Improvement`");
    expect(body).toContain("`Maintainability`");
    expect(body).toContain("`Security`");
    expect(body).toContain("`Performance`");
    expect(body).toContain("`Others`");
    expect(body).toContain("Split only what the user explicitly requested.");
    expect(body).toContain("first step in every Plan Mode turn");
    expect(body).not.toContain("whenever the request could contain multiple goals");
    expect(body).toContain("Output language must be English");
    expect(body).toContain("Improvement/<Subtype>");
    expect(body).toContain("Improvement/Performance: Improve load speed");
    expect(body).toContain("Create a reporting dashboard and add CSV export");
    expect(body).toContain("Create a reporting dashboard and improve load speed");
    expect(body).toContain("Create a reporting dashboard and write a quick-start guide");
  });

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
    expect(body).toContain("`wave(t) = 1 + max(wave(dep))`");
    expect(body).toContain("`wave(t) > wave(dep)`");
    expect(body).toContain("This skill only writes `Provisional`.");
  });

  it("ticket template includes detail-level fields", () => {
    const body = read("skills/ticketing/references/ticket-template.md");
    expect(body).toContain("Spec Detail Level");
    expect(body).toContain("Lean Fields (only for Lean)");
    expect(body).toContain("`wave(t) = 1 + max(wave(dep))`");
    expect(body).toContain("`wave(t) > wave(dep)`");
  });
});

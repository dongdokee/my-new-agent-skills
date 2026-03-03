# Selectable Install Location Scope Implementation Plan

**REQUIRED SUB-AGENTS:** Launch `code-reviewer` agent in the review step, focusing on
- simplicity/DRY/elegance
- bugs/functional correctness
- project conventions/abstractions

**REQUIRED SUB-SKILL:** Invoke `test-driven-development` to understand TDD-driven task structure

**Ticket:** `docs/plans/2026-03-03-selectable-install-location-scope-ticket.md`

**Goal:** Add install location scope selection (`Workspace`, `User`) with multi-select support (default: `Workspace`), dual-target installation in one run, and `--all` workspace-only behavior.

**Architecture:** Keep scanner/transform/installer write pipeline unchanged and inject scope behavior at orchestration/prompt level. Introduce a tiny scope resolver module for policy and target root resolution (`cwd`, `homedir`) and wire it into `prompts.ts` and `index.ts`. Preserve overwrite/upsert semantics and path layout.

**Tech Stack:** TypeScript, Node.js (`path`, `os`, `fs`), Vitest, Inquirer prompts

**Branch:** `feature/selectable-install-location-scope` (worktree branch for implementing-plans + using-git-worktrees)

**Skill References:** `@test-driven-development` `@using-git-worktrees` `@implementing-plans`

---

### Task 1: Add scope policy and install target resolver

**Files:**
- Create: `installer/src/scope.ts`
- Test: `installer/src/__tests__/scope.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { resolveScopesForRun, resolveInstallTargets } from "../scope.js";

describe("scope policy", () => {
  it("defaults to workspace when no interactive selection is provided", () => {
    expect(resolveScopesForRun({ allFlag: false, selected: [] })).toEqual(["workspace"]);
  });

  it("forces workspace-only when --all is true", () => {
    expect(resolveScopesForRun({ allFlag: true, selected: ["workspace", "user"] })).toEqual(["workspace"]);
  });

  it("resolves workspace+user targets with dedupe by root path", () => {
    const targets = resolveInstallTargets(["workspace", "user", "workspace"], "/repo", "/home/dd");
    expect(targets).toEqual([
      { scope: "workspace", rootPath: "/repo" },
      { scope: "user", rootPath: "/home/dd" },
    ]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd installer && npx vitest run src/__tests__/scope.test.ts -v`  
Expected: FAIL with module-not-found or missing export errors for `scope.ts`.

**Step 3: Write minimal implementation**

```ts
// installer/src/scope.ts
export type InstallScope = "workspace" | "user";

export interface InstallTarget {
  scope: InstallScope;
  rootPath: string;
}

export function resolveScopesForRun(input: {
  allFlag: boolean;
  selected: InstallScope[];
}): InstallScope[] {
  if (input.allFlag) return ["workspace"];
  return input.selected.length > 0 ? input.selected : ["workspace"];
}

export function resolveInstallTargets(
  scopes: InstallScope[],
  workspaceRoot: string,
  userRoot: string,
): InstallTarget[] {
  const ordered = scopes.map((scope) => ({
    scope,
    rootPath: scope === "workspace" ? workspaceRoot : userRoot,
  }));

  const seen = new Set<string>();
  const deduped: InstallTarget[] = [];
  for (const target of ordered) {
    if (seen.has(target.rootPath)) continue;
    seen.add(target.rootPath);
    deduped.push(target);
  }
  return deduped;
}
```

**Step 4: Run test to verify it passes**

Run: `cd installer && npx vitest run src/__tests__/scope.test.ts -v`  
Expected: PASS.

**Step 5: Review, refactor, and verify**

STRICTLY follow `Review` - `Refactor` - `Verify` cycle.

1. **Review**: Launch review agent
   - codes: Launch `code-reviewer` agent
   - prompt: "Review `installer/src/scope.ts` and `installer/src/__tests__/scope.test.ts` for correctness, DRY, and edge cases"
2. **Refactor**: Apply only necessary simplifications (naming, guard ordering)
3. **Verify**
   - Run: `cd installer && npx vitest run src/__tests__/scope.test.ts -v`
   - Expected: PASS

**Step 6: Commit**

```bash
git add installer/src/scope.ts installer/src/__tests__/scope.test.ts
git commit -m "feat(installer): add install scope policy and target resolver"
```

### Task 2: Add scope selection to interactive prompts

**Files:**
- Modify: `installer/src/prompts.ts`
- Test: `installer/src/__tests__/prompts.scope.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const checkbox = vi.fn();
const confirm = vi.fn();

vi.mock("@inquirer/prompts", () => ({ checkbox, confirm }));

import { runPrompts } from "../prompts.js";

describe("runPrompts scope selection", () => {
  beforeEach(() => {
    checkbox.mockReset();
    confirm.mockReset();
  });

  it("returns selected scopes and defaults workspace checked", async () => {
    checkbox
      .mockResolvedValueOnce(["workspace"]) // scope step
      .mockResolvedValueOnce(["claude"]) // platform step
      .mockResolvedValueOnce([]) // skills
      .mockResolvedValueOnce([]); // agents
    confirm.mockResolvedValueOnce(true);

    const scanResult = { skills: [], agents: [] };
    const result = await runPrompts(scanResult as never);

    expect(result?.scopes).toEqual(["workspace"]);

    const scopePrompt = checkbox.mock.calls[0][0];
    expect(scopePrompt.choices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "workspace", checked: true }),
        expect.objectContaining({ value: "user", checked: false }),
      ]),
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd installer && npx vitest run src/__tests__/prompts.scope.test.ts -v`  
Expected: FAIL because `InstallSelections` has no `scopes` and scope prompt step is missing.

**Step 3: Write minimal implementation**

```ts
// prompts.ts (핵심 변경)
import type { InstallScope } from "./scope.js";

export interface InstallSelections {
  scopes: InstallScope[];
  platforms: string[];
  skills: DiscoveredSkill[];
  agents: DiscoveredAgent[];
}

const scopes = await checkbox({
  message: "Select install locations:",
  choices: [
    { name: "Workspace", value: "workspace", checked: true },
    { name: "User", value: "user", checked: false },
  ],
});
if (scopes.length === 0) {
  console.log(chalk.yellow("No install locations selected."));
  return null;
}

// return 시 scopes 포함
return ok ? { scopes, platforms, skills, agents } : null;
```

**Step 4: Run test to verify it passes**

Run: `cd installer && npx vitest run src/__tests__/prompts.scope.test.ts -v`  
Expected: PASS.

**Step 5: Review, refactor, and verify**

STRICTLY follow `Review` - `Refactor` - `Verify` cycle.

1. **Review**: Launch `code-reviewer`
   - prompt: "Review scope prompt flow for UX defaults and type-safety"
2. **Refactor**: Remove duplicated literals, keep prompt step order explicit
3. **Verify**
   - Run: `cd installer && npx vitest run src/__tests__/prompts.scope.test.ts -v`
   - Expected: PASS

**Step 6: Commit**

```bash
git add installer/src/prompts.ts installer/src/__tests__/prompts.scope.test.ts
git commit -m "feat(installer): add workspace/user scope selection to interactive prompts"
```

### Task 3: Wire scope targets into install orchestration (`index.ts`)

**Files:**
- Modify: `installer/src/index.ts`
- Modify: `installer/src/__tests__/pipeline.test.ts`

**Step 1: Write the failing test**

```ts
// pipeline.test.ts 에 추가
it("supports writing same skill to workspace and user roots in one run shape", () => {
  const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
  const researching = skills.find((s) => s.name === "researching")!;

  const workspaceRoot = resolve(TEST_ROOT, "workspace-root");
  const userRoot = resolve(TEST_ROOT, "user-root");

  installSkill(researching, "claude", workspaceRoot);
  installSkill(researching, "claude", userRoot);

  expect(existsSync(resolve(workspaceRoot, ".claude/skills/researching/SKILL.md"))).toBe(true);
  expect(existsSync(resolve(userRoot, ".claude/skills/researching/SKILL.md"))).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `cd installer && npx vitest run src/__tests__/pipeline.test.ts -t "workspace and user roots" -v`  
Expected: FAIL before orchestration changes if target resolution/policy integration is incomplete.

**Step 3: Write minimal implementation**

```ts
// index.ts (핵심 변경)
import { homedir } from "node:os";
import { resolveScopesForRun, resolveInstallTargets, type InstallScope } from "./scope.js";

const workspaceRoot = process.cwd();
const userRoot = homedir();
const allFlag = process.argv.includes("--all");

let scopes: InstallScope[];

if (allFlag) {
  scopes = resolveScopesForRun({ allFlag: true, selected: ["workspace"] });
  platforms = Object.keys(loadPlatforms().platforms);
  skills = scanResult.skills;
  agents = scanResult.agents;
} else {
  const selections = await runPrompts(scanResult);
  if (!selections) process.exit(0);
  scopes = resolveScopesForRun({ allFlag: false, selected: selections.scopes });
  platforms = selections.platforms;
  skills = selections.skills;
  agents = selections.agents;
}

const targets = resolveInstallTargets(scopes, workspaceRoot, userRoot);

for (const target of targets) {
  for (const pid of platforms) {
    for (const s of skills) {
      if (s.manifest.platforms.includes(pid)) {
        results.push(...installSkill(s, pid, target.rootPath));
      }
    }
    for (const a of agents) {
      if (resolveAgentConfig(a.manifest, pid, loadPlatforms())) {
        results.push(...installAgent(a, pid, target.rootPath));
      }
    }
  }
}

for (const r of results) {
  const scopeLabel = r.outputPath.startsWith(userRoot) ? "user" : "workspace";
  const base = scopeLabel === "user" ? userRoot : workspaceRoot;
  console.log(`  ${icon} [${scopeLabel}] ${r.name} → ${r.outputPath.replace(base + "/", "")}`);
}
```

**Step 4: Run test to verify it passes**

Run: `cd installer && npx vitest run src/__tests__/scope.test.ts src/__tests__/pipeline.test.ts -v`  
Expected: PASS.

**Step 5: Review, refactor, and verify**

STRICTLY follow `Review` - `Refactor` - `Verify` cycle.

1. **Review**: Launch `code-reviewer`
   - prompt: "Review `index.ts` scope orchestration for regressions in existing workspace behavior"
2. **Refactor**: Simplify nested loops only if tests remain green
3. **Verify**
   - Run: `cd installer && npx vitest run src/__tests__/scope.test.ts src/__tests__/pipeline.test.ts -v`
   - Expected: PASS

**Step 6: Commit**

```bash
git add installer/src/index.ts installer/src/__tests__/pipeline.test.ts installer/src/scope.ts installer/src/__tests__/scope.test.ts
git commit -m "feat(installer): install to selected workspace/user targets"
```

### Task 4: Update docs and lock behavior with docs test

**Files:**
- Modify: `README.md`
- Modify: `installer/README.md`
- Modify: `AGENTS.md`
- Test: `installer/src/__tests__/docs.scope.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("scope docs", () => {
  it("documents workspace default + user optional + --all workspace-only", () => {
    const root = resolve(import.meta.dirname, "../../..");
    const readme = readFileSync(resolve(root, "README.md"), "utf-8");
    const installerReadme = readFileSync(resolve(root, "installer/README.md"), "utf-8");

    expect(readme).toContain("Workspace");
    expect(readme).toContain("User");
    expect(readme).toContain("--all");
    expect(readme).toContain("workspace-only");

    expect(installerReadme).toContain("Select install locations");
    expect(installerReadme).toContain("Workspace");
    expect(installerReadme).toContain("User");
    expect(installerReadme).toContain("--all");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd installer && npx vitest run src/__tests__/docs.scope.test.ts -v`  
Expected: FAIL because docs do not yet mention final scope behavior.

**Step 3: Write minimal implementation**

```md
# README.md / installer/README.md / AGENTS.md 반영 포인트
- 설치 wizard 첫 단계: Select install locations (Workspace default checked, User unchecked)
- Workspace+User 동시 선택 시 두 위치 모두 설치
- --all 모드: workspace-only (user 설치 불가)
- 기존 경로 구조(.claude/.gemini/.codex)와 overwrite/upsert 정책 유지
```

**Step 4: Run test to verify it passes**

Run: `cd installer && npx vitest run src/__tests__/docs.scope.test.ts -v`  
Expected: PASS.

**Step 5: Review, refactor, and verify**

STRICTLY follow `Review` - `Refactor` - `Verify` cycle.

1. **Review**: Launch `code-reviewer`
   - prompt: "Review doc changes for mismatch with actual runtime behavior"
2. **Refactor**: tighten wording, remove ambiguity
3. **Verify**
   - Run: `cd installer && npx vitest run src/__tests__/docs.scope.test.ts -v`
   - Expected: PASS

**Step 6: Commit**

```bash
git add README.md installer/README.md AGENTS.md installer/src/__tests__/docs.scope.test.ts
git commit -m "docs(installer): document workspace/user scope selection behavior"
```

### Task 5: Final regression pass for implementation PR

**Files:**
- Modify: `installer/src/__tests__/pipeline.test.ts`
- Test: `installer/src/__tests__/pipeline.test.ts`

**Step 1: Write the failing test**

```ts
it("keeps gemini code-explorer settings patch behavior in both target roots", () => {
  const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
  const explorer = agents.find((a) => a.name === "code-explorer")!;

  const workspaceRoot = resolve(TEST_ROOT, "ws");
  const userRoot = resolve(TEST_ROOT, "usr");

  installAgent(explorer, "gemini", workspaceRoot);
  installAgent(explorer, "gemini", userRoot);

  const wsSettings = JSON.parse(readFileSync(resolve(workspaceRoot, ".gemini/settings.json"), "utf-8"));
  const usrSettings = JSON.parse(readFileSync(resolve(userRoot, ".gemini/settings.json"), "utf-8"));

  expect(wsSettings.agents.overrides.codebase_investigator.enabled).toBe(false);
  expect(usrSettings.agents.overrides.codebase_investigator.enabled).toBe(false);
});
```

**Step 2: Run test to verify it fails**

Run: `cd installer && npx vitest run src/__tests__/pipeline.test.ts -t "both target roots" -v`  
Expected: FAIL until assertions/fixture setup are corrected.

**Step 3: Write minimal implementation**

```ts
// 필요한 최소 변경만 적용
// - fixture root 생성 보강
// - dual-root assertions를 기존 테스트들과 충돌 없이 분리
```

**Step 4: Run test to verify it passes**

Run: `cd installer && npx vitest run src/__tests__/pipeline.test.ts -v`  
Expected: PASS.

**Step 5: Review, refactor, and verify**

STRICTLY follow `Review` - `Refactor` - `Verify` cycle.

1. **Review**: Launch `code-reviewer`
   - prompt: "Review pipeline regressions around dual-target installation"
2. **Refactor**: remove duplicated fixtures and keep tests deterministic
3. **Verify**
   - Run: `cd installer && npx vitest run src/__tests__/pipeline.test.ts -v`
   - Expected: PASS

**Step 6: Commit**

```bash
git add installer/src/__tests__/pipeline.test.ts
git commit -m "test(installer): add dual-target regression coverage"
```

---

Plan complete
---

Plan file: `docs/plans/2026-03-03-selectable-install-location-scope-plan.md`  
Git worktree:
- branch: `feature/selectable-install-location-scope`
- path: `<to-be-created-by-using-git-worktrees>`

Open new session and use `implementing-plans` skill with the plan file.

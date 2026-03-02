import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { scanSkills } from "../scanner.js";
import { replacePlaceholders, buildMarkdownAgent, buildTomlAgent, updateCodexConfig } from "../transform.js";
import { installSkill, installAgent } from "../installer.js";

const TEST_ROOT = resolve(import.meta.dirname, "../../.test-output");
const SKILLS_ROOT = resolve(import.meta.dirname, "../../../skills");
const AGENTS_ROOT = resolve(import.meta.dirname, "../../../agents");

describe("scanner", () => {
  it("finds all skills with skill.yaml", () => {
    const result = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    expect(result.skills.map((s) => s.name).sort()).toEqual(
      ["reciting-task-state", "research"]
    );
  });

  it("finds agents with platform configs", () => {
    const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe("code-explorer");
    expect(agents[0].manifest.platforms.claude.model).toBe("haiku");
    expect(agents[0].manifest.platforms.gemini.model).toBe("gemini-2.0-flash");
    expect(agents[0].manifest.platforms.codex.model).toBe("o4-mini");
  });
});

describe("template engine", () => {
  it("replaces known placeholders, leaves unknown ones", () => {
    const tools = { search: "Grep", file_read: "Read" };
    expect(replacePlaceholders("Use {{tool.search}} and {{tool.file_read}} and {{tool.unknown}} and {{args}}", tools))
      .toBe("Use Grep and Read and {{tool.unknown}} and {{args}}");
  });
});

describe("transforms", () => {
  it("builds Claude markdown agent", () => {
    const out = buildMarkdownAgent("test", "A test", "claude", { model: "haiku", tools: ["Read"], maxTurns: 12 }, "body");
    expect(out).toContain("name: test");
    expect(out).toContain("maxTurns: 12");
    expect(out).not.toContain("kind:");
  });

  it("builds Gemini markdown agent with kind: local", () => {
    const out = buildMarkdownAgent("test", "A test", "gemini", { model: "gemini-2.0-flash", tools: ["grep_search"], max_turns: 12 }, "body");
    expect(out).toContain("kind: local");
    expect(out).toContain("max_turns: 12");
  });

  it("builds Codex TOML agent", () => {
    const out = buildTomlAgent({ model: "o4-mini", tools: [], model_reasoning_effort: "medium", sandbox_mode: "read-only" }, "body");
    expect(out).toContain('model = "o4-mini"');
    expect(out).toContain("developer_instructions");
  });

  it("updates Codex config.toml", () => {
    const out = updateCodexConfig("/nonexistent", "my-agent", "My agent", "agents/my-agent.toml");
    expect(out).toContain("[agents.my-agent]");
    expect(out).toContain('description = "My agent"');
  });
});

describe("installer integration", () => {
  beforeEach(() => mkdirSync(TEST_ROOT, { recursive: true }));
  afterEach(() => { if (existsSync(TEST_ROOT)) rmSync(TEST_ROOT, { recursive: true }); });

  it("installs skill for Claude as markdown", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const results = installSkill(skills.find((s) => s.name === "research")!, "claude", TEST_ROOT);
    expect(results[0].outputPath).toContain(".claude/skills/research/SKILL.md");
    expect(existsSync(results[0].outputPath)).toBe(true);
  });

  it("installs skill for Gemini as markdown", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const results = installSkill(skills.find((s) => s.name === "research")!, "gemini", TEST_ROOT);
    expect(results[0].outputPath).toContain(".gemini/skills/research/SKILL.md");
    expect(existsSync(results[0].outputPath)).toBe(true);
  });

  it("installs agent for Claude as markdown", () => {
    const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const results = installAgent(agents[0], "claude", TEST_ROOT);
    const content = readFileSync(results[0].outputPath, "utf-8");
    expect(content).toContain("model: haiku");
    expect(content).toContain("maxTurns: 12");
  });

  it("installs agent for Codex as TOML + config registration", () => {
    const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const results = installAgent(agents[0], "codex", TEST_ROOT);
    expect(readFileSync(results.find((r) => r.type === "agent")!.outputPath, "utf-8")).toContain('model = "o4-mini"');
    expect(readFileSync(results.find((r) => r.type === "config")!.outputPath, "utf-8")).toContain("[agents.code-explorer]");
  });
});

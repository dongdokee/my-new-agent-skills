import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { scanSkills } from "../scanner.js";
import { replacePlaceholders, buildMarkdownAgent, buildTomlAgent, updateCodexConfig } from "../transform.js";
import { installSkill, installAgent } from "../installer.js";
import { resolveAgentConfig, loadPlatforms } from "../config.js";

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

  it("finds agents with simplified profile/tools frontmatter", () => {
    const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe("code-explorer");
    expect(agents[0].manifest.profile).toBe("fast");
    expect(agents[0].manifest.tools).toEqual(["Read", "Glob", "Grep"]);
    expect(agents[0].manifest.platforms).toBeUndefined();
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

  it("builds Codex TOML agent with constant sandbox_mode", () => {
    const out = buildTomlAgent({ model: "o4-mini", tools: [], model_reasoning_effort: "medium" }, "body");
    expect(out).toContain('model = "o4-mini"');
    expect(out).toContain('sandbox_mode = "workspace-write"');
    expect(out).toContain("developer_instructions");
  });

  it("updates Codex config.toml", () => {
    const out = updateCodexConfig("/nonexistent", "my-agent", "My agent", "agents/my-agent.toml");
    expect(out).toContain("[agents.my-agent]");
    expect(out).toContain('description = "My agent"');
  });
});

describe("resolveAgentConfig", () => {
  const platforms = loadPlatforms();

  it("resolves claude config from profile+tools", () => {
    const manifest = { name: "test", description: "t", profile: "fast", tools: ["Read", "Glob", "Grep"], body: "" };
    const cfg = resolveAgentConfig(manifest, "claude", platforms);
    expect(cfg).not.toBeNull();
    const fastProfile = platforms.profiles!["fast"]["claude"];
    expect(cfg!.model).toBe(fastProfile.model);
    expect(cfg!.maxTurns).toBe(12);
    expect(cfg!.tools).toEqual(["Read", "Glob", "Grep"]);
  });

  it("resolves gemini config with tool name mapping from profile+tools", () => {
    const manifest = { name: "test", description: "t", profile: "fast", tools: ["Read", "Glob", "Grep"], body: "" };
    const cfg = resolveAgentConfig(manifest, "gemini", platforms);
    expect(cfg).not.toBeNull();
    expect(cfg!.model).toBe(platforms.profiles!["fast"]["gemini"].model);
    expect(cfg!.tools).toEqual(["read_file", "read_many_files", "glob", "list_directory", "grep_search"]);
  });

  it("resolves codex config from profile+tools", () => {
    const manifest = { name: "test", description: "t", profile: "fast", tools: ["Read", "Glob", "Grep"], body: "" };
    const cfg = resolveAgentConfig(manifest, "codex", platforms);
    expect(cfg).not.toBeNull();
    expect(cfg!.model).toBe(platforms.profiles!["fast"]["codex"].model);
    expect(cfg!.model_reasoning_effort).toBe("medium");
  });

  it("falls back to legacy platforms block", () => {
    const manifest = {
      name: "test", description: "t", body: "",
      platforms: { claude: { model: "claude-opus-4-6", tools: ["Read"], maxTurns: 5 } },
    };
    const cfg = resolveAgentConfig(manifest, "claude", platforms);
    expect(cfg!.model).toBe("claude-opus-4-6");
    expect(cfg!.maxTurns).toBe(5);
  });

  it("returns null for unknown profile", () => {
    const manifest = { name: "test", description: "t", profile: "nonexistent", tools: ["Read"], body: "" };
    const cfg = resolveAgentConfig(manifest, "claude", platforms);
    expect(cfg).toBeNull();
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
    const expectedModel = loadPlatforms().profiles!["fast"]["claude"].model;
    expect(content).toContain(`model: ${expectedModel}`);
    expect(content).toContain("maxTurns: 12");
  });

  it("installs code-explorer for Gemini and disables codebase_investigator in settings.json", () => {
    const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const results = installAgent(agents.find((a) => a.name === "code-explorer")!, "gemini", TEST_ROOT);
    const configResult = results.find((r) => r.type === "config");
    expect(configResult).toBeDefined();
    expect(configResult!.outputPath).toContain(".gemini/settings.json");
    const settings = JSON.parse(readFileSync(configResult!.outputPath, "utf-8"));
    expect(settings.agents.overrides.codebase_investigator.enabled).toBe(false);
  });

  it("installs agent for Codex as TOML + config registration", () => {
    const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const results = installAgent(agents[0], "codex", TEST_ROOT);
    const expectedModel = loadPlatforms().profiles!["fast"]["codex"].model;
    expect(readFileSync(results.find((r) => r.type === "agent")!.outputPath, "utf-8")).toContain(`model = "${expectedModel}"`);
    expect(readFileSync(results.find((r) => r.type === "config")!.outputPath, "utf-8")).toContain("[agents.code-explorer]");
  });
});

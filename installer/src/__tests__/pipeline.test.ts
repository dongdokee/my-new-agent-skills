import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { scanSkills } from "../scanner.js";
import { replacePlaceholders, buildMarkdownAgent, buildTomlAgent, updateCodexConfig, buildGeminiCommand } from "../transform.js";
import { installSkill, installAgent } from "../installer.js";
import { resolveAgentConfig, loadPlatforms } from "../config.js";

const TEST_ROOT = resolve(import.meta.dirname, "../../.test-output");
const SKILLS_ROOT = resolve(import.meta.dirname, "../../../skills");
const AGENTS_ROOT = resolve(import.meta.dirname, "../../../agents");

const PLATFORMS = ["claude", "gemini", "codex"] as const;

describe("scanner", () => {
  it("finds skills with skill.yaml + SKILL.md frontmatter", () => {
    const result = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    expect(result.skills.length).toBeGreaterThanOrEqual(1);
    for (const skill of result.skills) {
      expect(skill.name).toBeTruthy();
      expect(skill.description).toBeTruthy();
    }
  });

  it("discovers writing-plans as an installable skill", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const writingPlans = skills.find((s) => s.name === "writing-plans");
    expect(writingPlans).toBeDefined();
    expect(writingPlans?.manifest.command).toBe(true);
  });

  it("discovers implementing-plans as an installable skill", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const implementingPlans = skills.find((s) => s.name === "implementing-plans");
    expect(implementingPlans).toBeDefined();
    expect(implementingPlans?.manifest.command).toBe(true);
    expect(implementingPlans?.manifest.command_name).toBe("implement-plans");
  });

  it("all agents have valid manifest structure", () => {
    const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    expect(agents.length).toBeGreaterThanOrEqual(1);
    for (const agent of agents) {
      expect(agent.name).toBeTruthy();
      expect(agent.manifest.description).toBeTruthy();
      expect(agent.manifest.body).toBeTruthy();
      const hasNewFormat = !!agent.manifest.profile && !!agent.manifest.tools;
      const hasLegacy = !!agent.manifest.platforms;
      expect(hasNewFormat || hasLegacy).toBe(true);
    }
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

  it("buildGeminiCommand generates correct TOML", () => {
    const out = buildGeminiCommand("research", "My research skill");
    expect(out).toContain('description = "My research skill"');
    expect(out).toContain('prompt =');
    expect(out).toContain("Invoke the research skill");
    expect(out).toContain("{{args}}");
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
    expect(cfg!.tools).toEqual(["read_file", "read_many_files", "glob", "grep_search"]);
  });

  it("dedupes overlapping gemini tool mappings", () => {
    const manifest = {
      name: "test",
      description: "t",
      profile: "fast",
      tools: ["Read", "NotebookRead", "Glob", "LS", "KillShell", "BashOutput"],
      body: "",
    };
    const cfg = resolveAgentConfig(manifest, "gemini", platforms);
    expect(cfg).not.toBeNull();
    expect(cfg!.tools).toEqual([
      "read_file",
      "read_many_files",
      "glob",
      "list_directory",
      "run_shell_command",
    ]);
  });

  it("dedupes duplicated tools in non-gemini profiles too", () => {
    const manifest = {
      name: "test",
      description: "t",
      profile: "fast",
      tools: ["Read", "Read", "Glob", "Grep"],
      body: "",
    };
    const cfg = resolveAgentConfig(manifest, "claude", platforms);
    expect(cfg).not.toBeNull();
    expect(cfg!.tools).toEqual(["Read", "Glob", "Grep"]);
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
    const results = installSkill(skills.find((s) => s.name === "researching")!, "claude", TEST_ROOT);
    expect(results[0].outputPath).toContain(".claude/skills/researching/SKILL.md");
    expect(existsSync(results[0].outputPath)).toBe(true);
  });

  it("installs skill for Gemini as markdown", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const results = installSkill(skills.find((s) => s.name === "researching")!, "gemini", TEST_ROOT);
    expect(results[0].outputPath).toContain(".gemini/skills/researching/SKILL.md");
    expect(existsSync(results[0].outputPath)).toBe(true);
  });

  // Dynamic: all agents x all platforms
  const { agents } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
  const platforms = loadPlatforms();

  for (const agent of agents) {
    for (const platformId of PLATFORMS) {
      const cfg = resolveAgentConfig(agent.manifest, platformId, platforms);
      if (!cfg) continue;

      it(`installs ${agent.name} for ${platformId}`, () => {
        const results = installAgent(agent, platformId, TEST_ROOT);
        expect(results.length).toBeGreaterThanOrEqual(1);

        const agentResult = results.find((r) => r.type === "agent");
        expect(agentResult).toBeDefined();
        expect(existsSync(agentResult!.outputPath)).toBe(true);
        const content = readFileSync(agentResult!.outputPath, "utf-8");

        if (platformId === "claude") {
          expect(content).toContain(`model: ${cfg.model}`);
        } else if (platformId === "gemini") {
          expect(content).toContain(`model: ${cfg.model}`);
          expect(content).toContain("kind: local");
        } else if (platformId === "codex") {
          expect(content).toContain(`model = "${cfg.model}"`);
          const configResult = results.find((r) => r.type === "config");
          expect(configResult).toBeDefined();
          const configContent = readFileSync(configResult!.outputPath, "utf-8");
          expect(configContent).toContain(`[agents.${agent.name}]`);
        }
      });
    }
  }

  // Gemini command TOML tests
  it("installs research skill for gemini creates .gemini/commands/research.toml", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const research = skills.find((s) => s.name === "researching")!;
    const results = installSkill(research, "gemini", TEST_ROOT);
    const cmdResult = results.find((r) => r.type === "config" && r.name === "research.toml");
    expect(cmdResult).toBeDefined();
    expect(cmdResult!.outputPath).toContain(".gemini/commands/research.toml");
    expect(existsSync(cmdResult!.outputPath)).toBe(true);
    const content = readFileSync(cmdResult!.outputPath, "utf-8");
    expect(content).toContain("Invoke the research skill");
    expect(content).toContain("{{args}}");
  });

  it("installs research skill for claude does NOT create command TOML", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const research = skills.find((s) => s.name === "researching")!;
    const results = installSkill(research, "claude", TEST_ROOT);
    const cmdResult = results.find((r) => r.type === "config");
    expect(cmdResult).toBeUndefined();
  });

  it("installs writing-plans for gemini creates .gemini/commands/write-plans.toml", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const writingPlans = skills.find((s) => s.name === "writing-plans");
    expect(writingPlans).toBeDefined();
    if (!writingPlans) return;

    const results = installSkill(writingPlans, "gemini", TEST_ROOT);
    const cmdResult = results.find((r) => r.type === "config" && r.name === "write-plans.toml");
    expect(cmdResult).toBeDefined();
    expect(cmdResult!.outputPath).toContain(".gemini/commands/write-plans.toml");
    expect(existsSync(cmdResult!.outputPath)).toBe(true);
    const content = readFileSync(cmdResult!.outputPath, "utf-8");
    expect(content).toContain("Invoke the write-plans skill");
    expect(content).toContain("{{args}}");
  });

  it("installs implementing-plans for gemini creates .gemini/commands/implement-plans.toml", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const implementingPlans = skills.find((s) => s.name === "implementing-plans");
    expect(implementingPlans).toBeDefined();
    if (!implementingPlans) return;

    const results = installSkill(implementingPlans, "gemini", TEST_ROOT);
    const cmdResult = results.find((r) => r.type === "config" && r.name === "implement-plans.toml");
    expect(cmdResult).toBeDefined();
    expect(cmdResult!.outputPath).toContain(".gemini/commands/implement-plans.toml");
    expect(existsSync(cmdResult!.outputPath)).toBe(true);
    const content = readFileSync(cmdResult!.outputPath, "utf-8");
    expect(content).toContain("Invoke the implement-plans skill");
    expect(content).toContain("{{args}}");
  });

  it("throws when command is enabled but command_name is missing", () => {
    const { skills } = scanSkills(SKILLS_ROOT, AGENTS_ROOT);
    const researching = skills.find((s) => s.name === "researching");
    expect(researching).toBeDefined();
    if (!researching) return;

    const broken = {
      ...researching,
      manifest: {
        ...researching.manifest,
        command_name: undefined,
      },
    };

    expect(() => installSkill(broken, "gemini", TEST_ROOT)).toThrow(
      'Skill "researching" has command: true but missing command_name',
    );
  });

  // Side-effect test: code-explorer for Gemini disables codebase_investigator
  it("code-explorer for Gemini disables codebase_investigator", () => {
    const explorer = agents.find((a) => a.name === "code-explorer");
    if (!explorer) return;
    const results = installAgent(explorer, "gemini", TEST_ROOT);
    const configResult = results.find((r) => r.type === "config");
    expect(configResult).toBeDefined();
    const settings = JSON.parse(readFileSync(configResult!.outputPath, "utf-8"));
    expect(settings.agents.overrides.codebase_investigator.enabled).toBe(false);
  });
});

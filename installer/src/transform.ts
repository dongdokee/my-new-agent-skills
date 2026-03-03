import yaml from "js-yaml";
import TOML from "@iarna/toml";
import { readFileSync, existsSync } from "node:fs";
import type { AgentPlatformConfig } from "./config.js";

// --- Placeholder substitution ---

const PLACEHOLDER_RE = /\{\{tool\.(\w+)\}\}/g;

export function replacePlaceholders(body: string, tools: Record<string, string>): string {
  return body.replace(PLACEHOLDER_RE, (match, key: string) => tools[key] ?? match);
}

// --- Markdown transforms ---

export function buildMarkdownAgent(
  name: string,
  description: string,
  platformId: string,
  platformConfig: AgentPlatformConfig,
  body: string,
): string {
  const fm: Record<string, unknown> = { name, description };

  if (platformId === "gemini") fm.kind = "local";
  fm.tools = platformConfig.tools;
  fm.model = platformConfig.model;

  if (platformId === "gemini" && platformConfig.max_turns) {
    fm.max_turns = platformConfig.max_turns;
  } else if (platformConfig.maxTurns) {
    fm.maxTurns = platformConfig.maxTurns;
  }

  const fmStr = yaml.dump(fm, { lineWidth: -1, quotingType: '"', forceQuotes: false }).trimEnd();
  return `---\n${fmStr}\n---\n\n${body}\n`;
}

// --- TOML transforms ---

export function buildTomlAgent(platformConfig: AgentPlatformConfig, body: string): string {
  const obj: Record<string, unknown> = {
    model: platformConfig.model,
    sandbox_mode: "workspace-write",
    developer_instructions: body,
  };
  if (platformConfig.model_reasoning_effort) {
    obj.model_reasoning_effort = platformConfig.model_reasoning_effort;
  }
  return TOML.stringify(obj as TOML.JsonMap);
}

export function updateGeminiSettings(settingsPath: string): string {
  let existing: Record<string, unknown> = {};
  if (existsSync(settingsPath)) {
    existing = JSON.parse(readFileSync(settingsPath, "utf-8"));
  }

  // Deep-merge: agents.overrides.codebase_investigator.enabled = false
  if (!existing.agents || typeof existing.agents !== "object") existing.agents = {};
  const agents = existing.agents as Record<string, unknown>;
  if (!agents.overrides || typeof agents.overrides !== "object") agents.overrides = {};
  const overrides = agents.overrides as Record<string, unknown>;
  overrides.codebase_investigator = { enabled: false };

  // Deep-merge: context.fileName includes shared context files.
  if (!existing.context || typeof existing.context !== "object") existing.context = {};
  const context = existing.context as Record<string, unknown>;
  const currentFileNames = Array.isArray(context.fileName)
    ? context.fileName.filter((value): value is string => typeof value === "string")
    : [];
  context.fileName = [...new Set([...currentFileNames, "AGENTS.md", "CONTEXT.md", "GEMINI.md"])];

  return JSON.stringify(existing, null, 2) + "\n";
}

export function buildGeminiCommand(skillName: string, description: string): string {
  const obj: TOML.JsonMap = {
    description,
    prompt: `Invoke the ${skillName} skill and follow it exactly as presented to you: {{args}}`,
  };
  return TOML.stringify(obj);
}

export function updateCodexConfig(
  configPath: string,
  agentName: string,
  description: string,
  configFile: string,
): string {
  let existing: TOML.JsonMap = {};
  if (existsSync(configPath)) {
    existing = TOML.parse(readFileSync(configPath, "utf-8"));
  }

  if (!existing.agents || typeof existing.agents !== "object") {
    existing.agents = {} as TOML.JsonMap;
  }
  (existing.agents as TOML.JsonMap)[agentName] = { description, config_file: configFile } as TOML.JsonMap;

  return TOML.stringify(existing);
}

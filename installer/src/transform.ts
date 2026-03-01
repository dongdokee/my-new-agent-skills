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

export function buildTomlCommand(description: string, body: string): string {
  return TOML.stringify({ description, prompt: body } as TOML.JsonMap);
}

export function buildTomlAgent(platformConfig: AgentPlatformConfig, body: string): string {
  return TOML.stringify({
    model: platformConfig.model,
    model_reasoning_effort: platformConfig.model_reasoning_effort ?? "medium",
    sandbox_mode: platformConfig.sandbox_mode ?? "read-only",
    developer_instructions: body,
  } as TOML.JsonMap);
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

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

// --- Types ---

export interface PlatformConfig {
  display_name: string;
  skill_path: string;
  agent_path: string;
  format: "markdown" | "toml";
  command_format?: "toml";
  config_file?: string;
  tools: Record<string, string>;
}

export interface PlatformsConfig {
  platforms: Record<string, PlatformConfig>;
}

export interface SkillManifest {
  name: string;
  description: string;
  platforms: string[];
  install_as: "command" | "skill";
  include: string[];
  agents?: string[];
}

export interface AgentPlatformConfig {
  model: string;
  tools: string[];
  maxTurns?: number;
  max_turns?: number;
  model_reasoning_effort?: string;
  sandbox_mode?: string;
}

export interface AgentManifest {
  name: string;
  description: string;
  platforms: Record<string, AgentPlatformConfig>;
  body: string;
}

// --- Platforms ---

let cachedPlatforms: PlatformsConfig | null = null;

export function loadPlatforms(customPath?: string): PlatformsConfig {
  if (cachedPlatforms && !customPath) return cachedPlatforms;

  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const candidates = customPath
    ? [customPath]
    : [
        resolve(scriptDir, "../platforms.yaml"),
        resolve(scriptDir, "../../platforms.yaml"),
      ];

  const configPath = candidates.find((p) => existsSync(p));
  if (!configPath) throw new Error("platforms.yaml not found");

  const config = yaml.load(readFileSync(configPath, "utf-8")) as PlatformsConfig;
  if (!customPath) cachedPlatforms = config;
  return config;
}

export function getPlatform(id: string): PlatformConfig {
  const p = loadPlatforms().platforms[id];
  if (!p) throw new Error(`Unknown platform: ${id}`);
  return p;
}

// --- Manifests ---

export function loadSkillManifest(skillDir: string): SkillManifest | null {
  const path = resolve(skillDir, "skill.yaml");
  if (!existsSync(path)) return null;
  return yaml.load(readFileSync(path, "utf-8")) as SkillManifest;
}

export function parseAgentFrontmatter(filePath: string): AgentManifest | null {
  if (!existsSync(filePath)) return null;

  const raw = readFileSync(filePath, "utf-8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const fm = yaml.load(match[1]) as Record<string, unknown>;
  return {
    name: fm.name as string,
    description: fm.description as string,
    platforms: (fm.platforms ?? {}) as Record<string, AgentPlatformConfig>,
    body: match[2].trim(),
  };
}

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
  config_file?: string;
  tools: Record<string, string>;
}

export interface AgentToolMap {
  [claudeTool: string]: {
    gemini?: string[];
  };
}

export interface ProfilePlatformConfig {
  model: string;
  maxTurns?: number;
  max_turns?: number;
  model_reasoning_effort?: string;
}

export interface PlatformsConfig {
  platforms: Record<string, PlatformConfig>;
  agent_tool_map?: AgentToolMap;
  profiles?: Record<string, Record<string, ProfilePlatformConfig>>;
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
  // New simplified format
  profile?: string;
  tools?: string[];
  // Legacy format (kept for backward compat)
  platforms?: Record<string, AgentPlatformConfig>;
  body: string;
}

function dedupeTools(tools: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tool of tools) {
    if (!seen.has(tool)) {
      seen.add(tool);
      out.push(tool);
    }
  }
  return out;
}

function normalizeTools(tools: string[] | undefined): string[] {
  if (!Array.isArray(tools)) return [];
  return dedupeTools(tools);
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
  const manifest: AgentManifest = {
    name: fm.name as string,
    description: fm.description as string,
    body: match[2].trim(),
  };

  if (fm.profile) manifest.profile = fm.profile as string;
  if (fm.tools) manifest.tools = fm.tools as string[];
  if (fm.platforms) manifest.platforms = fm.platforms as Record<string, AgentPlatformConfig>;

  return manifest;
}

export function resolveAgentConfig(
  manifest: AgentManifest,
  platformId: string,
  platforms: PlatformsConfig,
): AgentPlatformConfig | null {
  // New format: profile + tools
  if (manifest.profile && manifest.tools) {
    const profileEntry = platforms.profiles?.[manifest.profile]?.[platformId];
    if (!profileEntry) return null;

    let tools: string[];
    if (platformId === "gemini") {
      tools = manifest.tools.flatMap(
        (t) => platforms.agent_tool_map?.[t]?.gemini ?? [],
      );
    } else {
      tools = manifest.tools; // claude: as-is; codex: unused but kept
    }

    return { ...profileEntry, tools: normalizeTools(tools) };
  }

  // Legacy format: platforms block
  const legacy = manifest.platforms?.[platformId];
  if (!legacy) return null;
  return { ...legacy, tools: normalizeTools(legacy.tools) };
}

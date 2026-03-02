import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { getPlatform } from "./config.js";
import type { DiscoveredSkill, DiscoveredAgent } from "./scanner.js";
import { replacePlaceholders, buildMarkdownAgent, buildTomlAgent, updateCodexConfig } from "./transform.js";

export interface InstallResult {
  type: "skill" | "agent" | "config";
  name: string;
  outputPath: string;
}

function ensureDir(filePath: string) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function writeOutput(path: string, content: string): void {
  ensureDir(path);
  writeFileSync(path, content, "utf-8");
}

function copyReferences(skillDir: string, targetDir: string): void {
  const refsDir = resolve(skillDir, "references");
  if (!existsSync(refsDir)) return;
  const target = resolve(targetDir, "references");
  mkdirSync(target, { recursive: true });
  cpSync(refsDir, target, { recursive: true });
}

export function installSkill(skill: DiscoveredSkill, platformId: string, projectRoot: string): InstallResult[] {
  const platform = getPlatform(platformId);
  const body = replacePlaceholders(readFileSync(skill.skillFilePath, "utf-8").trim(), platform.tools);
  const output = body + "\n";
  const outputPath = resolve(projectRoot, platform.skill_path, skill.name, `${skill.name}.md`);
  writeOutput(outputPath, output);

  const results: InstallResult[] = [{ type: "skill", name: skill.name, outputPath }];

  if (skill.manifest.include?.some((i) => i.startsWith("references"))) {
    copyReferences(skill.dir, resolve(projectRoot, platform.skill_path, skill.name));
  }

  return results;
}

export function installAgent(agent: DiscoveredAgent, platformId: string, projectRoot: string): InstallResult[] {
  const platform = getPlatform(platformId);
  const platformConfig = agent.manifest.platforms[platformId];
  if (!platformConfig) return [];

  const body = replacePlaceholders(agent.manifest.body, platform.tools);
  const results: InstallResult[] = [];

  if (platformId === "codex") {
    const outputPath = resolve(projectRoot, platform.agent_path, `${agent.name}.toml`);
    writeOutput(outputPath, buildTomlAgent(platformConfig, body));
    results.push({ type: "agent", name: agent.name, outputPath });

    if (platform.config_file) {
      const configPath = resolve(projectRoot, platform.config_file);
      ensureDir(configPath);
      writeOutput(configPath, updateCodexConfig(configPath, agent.name, agent.manifest.description, `agents/${agent.name}.toml`));
      results.push({ type: "config", name: "config.toml", outputPath: configPath });
    }
  } else {
    const outputPath = resolve(projectRoot, platform.agent_path, `${agent.name}.md`);
    writeOutput(outputPath, buildMarkdownAgent(agent.name, agent.manifest.description, platformId, platformConfig, body));
    results.push({ type: "agent", name: agent.name, outputPath });
  }

  return results;
}

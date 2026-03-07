import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, chmodSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { getPlatform, loadPlatforms, resolveAgentConfig } from "./config.js";
import type { DiscoveredSkill, DiscoveredAgent } from "./scanner.js";
import { replacePlaceholders, buildMarkdownAgent, buildTomlAgent, updateCodexConfig, updateGeminiSettings, buildGeminiCommand, mergeGeminiHooks } from "./transform.js";

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
  const outputPath = resolve(projectRoot, platform.skill_path, skill.name, `SKILL.md`);
  writeOutput(outputPath, output);

  const results: InstallResult[] = [{ type: "skill", name: skill.name, outputPath }];

  if (skill.manifest.include?.some((i) => i.startsWith("references"))) {
    copyReferences(skill.dir, resolve(projectRoot, platform.skill_path, skill.name));
  }

  if (platformId === "gemini" && skill.manifest.command && platform.command_path) {
    if (!skill.manifest.command_name) {
      throw new Error(`Skill "${skill.name}" has command: true but missing command_name`);
    }
    const commandName = skill.manifest.command_name;
    const cmdPath = resolve(projectRoot, platform.command_path, `${commandName}.toml`);
    writeOutput(cmdPath, buildGeminiCommand(commandName, skill.description));
    results.push({ type: "config", name: `${commandName}.toml`, outputPath: cmdPath });
  }

  if (platformId === "gemini" && skill.manifest.hooks?.length) {
    const hooksDir = resolve(projectRoot, ".gemini", "hooks");
    mkdirSync(hooksDir, { recursive: true });
    for (const hookRelPath of skill.manifest.hooks) {
      const src = resolve(skill.dir, hookRelPath);
      const name = basename(hookRelPath);
      if (name === "settings-snippet.json") {
        const settingsPath = resolve(projectRoot, ".gemini", "settings.json");
        writeOutput(settingsPath, mergeGeminiHooks(settingsPath, src));
        results.push({ type: "config", name: "settings.json", outputPath: settingsPath });
      } else if (hookRelPath.endsWith(".sh")) {
        const dest = resolve(hooksDir, name);
        cpSync(src, dest);
        chmodSync(dest, 0o755);
        results.push({ type: "config", name, outputPath: dest });
      }
    }
  }

  return results;
}

export function installAgent(agent: DiscoveredAgent, platformId: string, projectRoot: string): InstallResult[] {
  const platform = getPlatform(platformId);
  const platformConfig = resolveAgentConfig(agent.manifest, platformId, loadPlatforms());
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

    // Post-install side-effect for Gemini + code-explorer: shared context defaults
    if (platformId === "gemini" && agent.name === "code-explorer") {
      const settingsPath = resolve(projectRoot, ".gemini/settings.json");
      writeOutput(settingsPath, updateGeminiSettings(settingsPath));
      results.push({ type: "config", name: "settings.json", outputPath: settingsPath });
    }
  }

  return results;
}

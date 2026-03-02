import { readdirSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { loadSkillManifest, parseAgentFrontmatter, parseSkillFrontmatter } from "./config.js";
import type { SkillManifest, AgentManifest } from "./config.js";

export interface DiscoveredSkill {
  name: string;
  description: string;
  dir: string;
  manifest: SkillManifest;
  skillFilePath: string;
}

export interface DiscoveredAgent {
  name: string;
  skillName: string;
  filePath: string;
  manifest: AgentManifest;
}

export interface ScanResult {
  skills: DiscoveredSkill[];
  agents: DiscoveredAgent[];
}

function scanAgentPath(path: string, skillName: string, agents: DiscoveredAgent[]) {
  if (!existsSync(path)) return;

  if (statSync(path).isDirectory()) {
    for (const f of readdirSync(path).filter((f) => f.endsWith(".md"))) {
      const manifest = parseAgentFrontmatter(resolve(path, f));
      if (manifest) agents.push({ name: manifest.name, skillName, filePath: resolve(path, f), manifest });
    }
  } else {
    const manifest = parseAgentFrontmatter(path);
    if (manifest) agents.push({ name: manifest.name, skillName, filePath: path, manifest });
  }
}

export function scanSkills(skillsDir: string, agentsDir?: string): ScanResult {
  const skills: DiscoveredSkill[] = [];
  const agents: DiscoveredAgent[] = [];

  if (!existsSync(skillsDir)) return { skills, agents };

  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const dir = resolve(skillsDir, entry.name);
    const manifest = loadSkillManifest(dir);
    if (!manifest) continue;

    const skillFilePath = resolve(dir, "SKILL.md");
    if (!existsSync(skillFilePath)) continue;
    const skillFrontmatter = parseSkillFrontmatter(skillFilePath);
    if (!skillFrontmatter) continue;

    skills.push({ name: skillFrontmatter.name, description: skillFrontmatter.description, dir, manifest, skillFilePath });

    for (const agentPath of manifest.agents ?? []) {
      scanAgentPath(resolve(dir, agentPath), skillFrontmatter.name, agents);
    }
  }

  if (agentsDir) {
    scanAgentPath(agentsDir, "", agents);
  }

  return { skills, agents };
}

import { checkbox, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { loadPlatforms, resolveAgentConfig } from "./config.js";
import type { DiscoveredSkill, DiscoveredAgent, ScanResult } from "./scanner.js";

export interface InstallSelections {
  platforms: string[];
  skills: DiscoveredSkill[];
  agents: DiscoveredAgent[];
}

export async function runPrompts(scanResult: ScanResult): Promise<InstallSelections | null> {
  const config = loadPlatforms();
  const platformIds = Object.keys(config.platforms);

  // Step 1: Platform selection
  const platforms = await checkbox({
    message: "Select target platforms:",
    choices: platformIds.map((id) => ({
      name: config.platforms[id].display_name,
      value: id,
      checked: id === "claude",
    })),
  });
  if (platforms.length === 0) { console.log(chalk.yellow("No platforms selected.")); return null; }

  // Step 2: Skill selection
  const skillChoices = scanResult.skills
    .filter((s) => platforms.some((p) => s.manifest.platforms.includes(p)))
    .map((s) => ({ name: s.name, value: s, checked: true }));
  const skills = skillChoices.length > 0
    ? await checkbox({ message: "Select skills to install:", choices: skillChoices })
    : [];

  // Step 3: Agent selection
  const platformsCfg = loadPlatforms();
  const agentChoices = scanResult.agents
    .filter((a) => platforms.some((p) => resolveAgentConfig(a.manifest, p, platformsCfg) !== null))
    .map((a) => ({ name: a.skillName ? `${a.skillName}/${a.name}` : a.name, value: a, checked: true }));
  const agents = agentChoices.length > 0
    ? await checkbox({ message: "Select agents to install:", choices: agentChoices })
    : [];

  if (skills.length === 0 && agents.length === 0) {
    console.log(chalk.yellow("Nothing selected to install."));
    return null;
  }

  // Step 4: Confirmation summary
  console.log();
  for (const pid of platforms) {
    console.log(chalk.bold(`  Platform: ${config.platforms[pid].display_name}`));
    const sNames = skills.filter((s) => s.manifest.platforms.includes(pid)).map((s) => s.name);
    if (sNames.length) console.log(`  Skills (${sNames.length}): ${sNames.join(", ")}`);
    const aNames = agents.filter((a) => resolveAgentConfig(a.manifest, pid, platformsCfg)).map((a) => a.name);
    if (aNames.length) console.log(`  Agents (${aNames.length}): ${aNames.join(", ")}`);
    console.log();
  }

  const ok = await confirm({ message: "Proceed with installation?", default: true });
  return ok ? { platforms, skills, agents } : null;
}

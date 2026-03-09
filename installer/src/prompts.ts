import { checkbox, confirm, select } from "@inquirer/prompts";
import { homedir } from "node:os";
import chalk from "chalk";
import { loadPlatforms, resolveAgentConfig } from "./config.js";
import type { PlatformsConfig } from "./config.js";
import type { DiscoveredSkill, DiscoveredAgent, DiscoveredHook, ScanResult } from "./scanner.js";

export interface InstallSelections {
  installRoot: string;
  platforms: string[];
  skills: DiscoveredSkill[];
  agents: DiscoveredAgent[];
  hooks: DiscoveredHook[];
  hookPlatforms: string[];
}

export function getInstallRootChoices(
  cwd: string = process.cwd(),
  home: string = homedir(),
): Array<{ name: string; value: string }> {
  const candidates = [
    { label: "Current directory", value: cwd },
    { label: "Home directory", value: home },
  ];

  const seen = new Set<string>();
  return candidates
    .filter((choice) => {
      if (seen.has(choice.value)) return false;
      seen.add(choice.value);
      return true;
    })
    .map((choice) => ({
      name: `${choice.label} (${choice.value})`,
      value: choice.value,
    }));
}

export interface ConfirmationSummary {
  installRoot: string;
  platforms: Array<{
    displayName: string;
    skills: string[];
    agents: string[];
  }>;
  hooks: null | {
    bundles: string[];
    platforms: string[];
  };
}

export function buildConfirmationSummary(
  {
    installRoot,
    platforms,
    skills,
    agents,
    hooks,
    hookPlatforms,
  }: InstallSelections,
  config: PlatformsConfig = loadPlatforms(),
): ConfirmationSummary {
  return {
    installRoot,
    platforms: platforms.map((pid) => ({
      displayName: config.platforms[pid].display_name,
      skills: skills.filter((s) => s.manifest.platforms.includes(pid)).map((s) => s.name),
      agents: agents.filter((a) => resolveAgentConfig(a.manifest, pid, config)).map((a) => a.name),
    })),
    hooks: hooks.length > 0 && hookPlatforms.length > 0
      ? {
          bundles: hooks.map((h) => h.name),
          platforms: hookPlatforms.map((pid) => config.platforms[pid].display_name),
        }
      : null,
  };
}

export async function runPrompts(scanResult: ScanResult): Promise<InstallSelections | null> {
  const config = loadPlatforms();
  const platformIds = Object.keys(config.platforms);
  const installRootChoices = getInstallRootChoices();

  const installRoot = await select({
    message: "Select install root:",
    choices: installRootChoices,
    default: process.cwd(),
  });

  // Step 2: Platform selection
  const platforms = await checkbox({
    message: "Select target platforms:",
    choices: platformIds.map((id) => ({
      name: config.platforms[id].display_name,
      value: id,
      checked: id === "claude",
    })),
  });

  // Step 3: Skill selection
  const skillChoices = scanResult.skills
    .filter((s) => platforms.some((p) => s.manifest.platforms.includes(p)))
    .map((s) => ({ name: s.name, value: s, checked: true }));
  const skills = skillChoices.length > 0
    ? await checkbox({ message: "Select skills to install:", choices: skillChoices })
    : [];

  // Step 4: Agent selection
  const agentChoices = scanResult.agents
    .filter((a) => platforms.some((p) => resolveAgentConfig(a.manifest, p, config) !== null))
    .map((a) => ({ name: a.skillName ? `${a.skillName}/${a.name}` : a.name, value: a, checked: true }));
  const agents = agentChoices.length > 0
    ? await checkbox({ message: "Select agents to install:", choices: agentChoices })
    : [];

  // Step 5: Hook bundle selection
  const hookChoices = scanResult.hooks
    .map((h) => ({ name: h.name, value: h, checked: true }));
  const hooks = hookChoices.length > 0
    ? await checkbox({ message: "Select hooks to install:", choices: hookChoices })
    : [];

  // Step 6: Hook target platform selection
  const hookPlatformCandidates = ["claude", "gemini"]
    .filter((pid) => hooks.some((h) => h.manifest.platforms.includes(pid)));
  const hookPlatforms = hooks.length > 0 && hookPlatformCandidates.length > 0
    ? await checkbox({
      message: "Select hook target platforms:",
      choices: hookPlatformCandidates.map((pid) => ({
        name: config.platforms[pid].display_name,
        value: pid,
        checked: true,
      })),
    })
    : [];

  const hasHookSelection = hooks.length > 0 && hookPlatforms.length > 0;
  if (skills.length === 0 && agents.length === 0 && !hasHookSelection) {
    console.log(chalk.yellow("Nothing selected to install."));
    return null;
  }

  // Step 7: Confirmation summary
  const summary = buildConfirmationSummary({
    installRoot,
    platforms,
    skills,
    agents,
    hooks,
    hookPlatforms,
  }, config);

  console.log();
  console.log(chalk.bold(`  Install root: ${summary.installRoot}`));
  console.log();
  for (const section of summary.platforms) {
    console.log(chalk.bold(`  Platform: ${section.displayName}`));
    if (section.skills.length) console.log(`  Skills (${section.skills.length}): ${section.skills.join(", ")}`);
    if (section.agents.length) console.log(`  Agents (${section.agents.length}): ${section.agents.join(", ")}`);
    console.log();
  }

  if (summary.hooks) {
    console.log(chalk.bold("  Hooks"));
    console.log(`  Bundles (${summary.hooks.bundles.length}): ${summary.hooks.bundles.join(", ")}`);
    console.log(`  Platforms (${summary.hooks.platforms.length}): ${summary.hooks.platforms.join(", ")}`);
    console.log();
  }

  const ok = await confirm({ message: "Proceed with installation?", default: true });
  return ok ? { installRoot, platforms, skills, agents, hooks, hookPlatforms } : null;
}

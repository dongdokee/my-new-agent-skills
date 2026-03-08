import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import ora from "ora";
import { scanSkills } from "./scanner.js";
import { runPrompts } from "./prompts.js";
import { installSkill, installAgent, installHook } from "./installer.js";
import { loadPlatforms, resolveAgentConfig } from "./config.js";
import type { InstallResult } from "./installer.js";

function resolveSourceRoot(): string {
  const cwdRoot = process.cwd();
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const scriptRoot = resolve(scriptDir, "../..");

  const hasRepoLayout = (root: string): boolean =>
    existsSync(resolve(root, "skills")) || existsSync(resolve(root, "agents")) || existsSync(resolve(root, "hooks"));

  if (hasRepoLayout(cwdRoot)) return cwdRoot;
  return scriptRoot;
}

async function main() {
  const sourceRoot = resolveSourceRoot();
  const installRoot = process.cwd();
  const allFlag = process.argv.includes("--all");

  console.log(chalk.bold("\n  Agent Skill Installer\n"));

  const spinner = ora("Scanning skills, agents, hooks...").start();
  const agentsDir = resolve(sourceRoot, "agents");
  const hooksDir = resolve(sourceRoot, "hooks");
  const scanResult = scanSkills(resolve(sourceRoot, "skills"), agentsDir, hooksDir);
  spinner.succeed(`Found ${scanResult.skills.length} skills, ${scanResult.agents.length} agents, ${scanResult.hooks.length} hooks`);

  if (scanResult.skills.length === 0 && scanResult.agents.length === 0 && scanResult.hooks.length === 0) {
    console.log(chalk.yellow("No installable skills, agents, or hooks found."));
    process.exit(0);
  }

  let platforms: string[];
  let skills: typeof scanResult.skills;
  let agents: typeof scanResult.agents;
  let hooks: typeof scanResult.hooks;
  let hookPlatforms: string[];

  if (allFlag) {
    platforms = Object.keys(loadPlatforms().platforms);
    skills = scanResult.skills;
    agents = scanResult.agents;
    hooks = [];
    hookPlatforms = [];
  } else {
    const selections = await runPrompts(scanResult);
    if (!selections) process.exit(0);
    platforms = selections.platforms;
    skills = selections.skills;
    agents = selections.agents;
    hooks = selections.hooks;
    hookPlatforms = selections.hookPlatforms;
  }

  const installSpinner = ora("Installing...").start();
  const results: InstallResult[] = [];

  for (const pid of platforms) {
    for (const s of skills) {
      if (s.manifest.platforms.includes(pid)) results.push(...installSkill(s, pid, installRoot));
    }
    for (const a of agents) {
      if (resolveAgentConfig(a.manifest, pid, loadPlatforms())) results.push(...installAgent(a, pid, installRoot));
    }
  }
  for (const h of hooks) {
    for (const pid of hookPlatforms) {
      if (h.manifest.platforms.includes(pid)) results.push(...installHook(h, pid, installRoot));
    }
  }
  installSpinner.stop();

  for (const r of results) {
    const icon = r.type === "config" ? chalk.blue("⚙") : chalk.green("✓");
    console.log(`  ${icon} ${r.name} → ${r.outputPath.replace(installRoot + "/", "")}`);
  }
  console.log(chalk.bold(`\n  Done! ${results.length} items installed.\n`));
}

main().catch((err) => { console.error(chalk.red("Error:"), err.message); process.exit(1); });

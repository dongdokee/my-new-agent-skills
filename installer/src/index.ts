import { resolve } from "node:path";
import chalk from "chalk";
import ora from "ora";
import { scanSkills } from "./scanner.js";
import { runPrompts } from "./prompts.js";
import { installSkill, installAgent } from "./installer.js";
import { loadPlatforms, resolveAgentConfig } from "./config.js";
import type { InstallResult } from "./installer.js";

async function main() {
  const projectRoot = process.cwd();
  const allFlag = process.argv.includes("--all");

  console.log(chalk.bold("\n  Agent Skill Installer\n"));

  const spinner = ora("Scanning skills...").start();
  const agentsDir = resolve(projectRoot, "agents");
  const scanResult = scanSkills(resolve(projectRoot, "skills"), agentsDir);
  spinner.succeed(`Found ${scanResult.skills.length} skills, ${scanResult.agents.length} agents`);

  if (scanResult.skills.length === 0 && scanResult.agents.length === 0) {
    console.log(chalk.yellow("No installable skills found. Ensure each skill has a skill.yaml."));
    process.exit(0);
  }

  let platforms: string[];
  let skills: typeof scanResult.skills;
  let agents: typeof scanResult.agents;

  if (allFlag) {
    platforms = Object.keys(loadPlatforms().platforms);
    skills = scanResult.skills;
    agents = scanResult.agents;
  } else {
    const selections = await runPrompts(scanResult);
    if (!selections) process.exit(0);
    platforms = selections.platforms;
    skills = selections.skills;
    agents = selections.agents;
  }

  const installSpinner = ora("Installing...").start();
  const results: InstallResult[] = [];

  for (const pid of platforms) {
    for (const s of skills) {
      if (s.manifest.platforms.includes(pid)) results.push(...installSkill(s, pid, projectRoot));
    }
    for (const a of agents) {
      if (resolveAgentConfig(a.manifest, pid, loadPlatforms())) results.push(...installAgent(a, pid, projectRoot));
    }
  }
  installSpinner.stop();

  for (const r of results) {
    const icon = r.type === "config" ? chalk.blue("⚙") : chalk.green("✓");
    console.log(`  ${icon} ${r.name} → ${r.outputPath.replace(projectRoot + "/", "")}`);
  }
  console.log(chalk.bold(`\n  Done! ${results.length} items installed.\n`));
}

main().catch((err) => { console.error(chalk.red("Error:"), err.message); process.exit(1); });

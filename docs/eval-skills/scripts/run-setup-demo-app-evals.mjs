import {
  readdirSync,
  mkdirSync,
  readFileSync,
  existsSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const EVAL_DIR = path.join(PROJECT_ROOT, "docs", "eval-skills", "scripts");
const ARTIFACT_DIR = path.join(PROJECT_ROOT, "docs", "eval-skills", "artifacts");
const PROMPT_CSV_PATH = path.join(EVAL_DIR, "setup-demo-app.prompts.csv");
const SUMMARY_PATH = path.join(ARTIFACT_DIR, "eval-summary.json");
const MAX_COMMAND_COUNT = 80;

const SCAFFOLD_COMMAND_RE =
  /(?:npm\s+create|yarn\s+create|pnpm\s+create|bunx|create-vite|npx\s+create-vite|npx\s+create)\s+.*vite/i;
const NPM_INSTALL_RE = /\bnpm\s+install\b/i;

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

function parsePromptCsv(csvPath) {
  const raw = readFileSync(csvPath, "utf8").trim();
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const cases = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.length < 3) {
      continue;
    }

    const [id, shouldTriggerRaw, ...promptParts] = row;
    const prompt = promptParts.join(",");
    cases.push({
      id,
      should_trigger:
        String(shouldTriggerRaw).trim().toLowerCase() === "true",
      prompt: prompt?.replace(/^"|"$/g, ""),
    });
  }

  return cases;
}

function runCodex(prompt, outJsonlPath, cwd) {
  const res = spawnSync(
    "codex",
    ["exec", "--json", "--full-auto", prompt],
    {
      encoding: "utf8",
      cwd,
    },
  );

  mkdirSync(path.dirname(outJsonlPath), { recursive: true });
  writeFileSync(outJsonlPath, res.stdout || "", "utf8");

  return {
    exitCode: res.status ?? 1,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
  };
}

function parseJsonl(jsonlText) {
  const lines = jsonlText.split("\n").map((line) => line.trim()).filter(Boolean);
  const events = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      // skip non-JSON lines that can appear in some tool outputs
    }
  }
  return events;
}

function getCommand(item) {
  const commandValue = item?.item?.command;
  if (typeof commandValue === "string") return commandValue;
  if (Array.isArray(commandValue)) return commandValue.join(" ");
  return "";
}

function collectCommandItems(events) {
  return events.filter(
    (event) =>
      (event.type === "item.started" || event.type === "item.completed") &&
      event.item?.type === "command_execution",
  );
}

function hasNpmInstall(commandItems) {
  return commandItems.some((event) => NPM_INSTALL_RE.test(getCommand(event)));
}

function hasScaffoldCommand(commandItems) {
  return commandItems.some((event) =>
    SCAFFOLD_COMMAND_RE.test(getCommand(event)),
  );
}

function findProjectRoots(workspaceDir) {
  const roots = [];

  const topLevels = readdirSync(workspaceDir, { withFileTypes: true });
  for (const entry of topLevels) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    const candidate = path.join(workspaceDir, entry.name);
    if (existsSync(path.join(candidate, "package.json"))) {
      roots.push(candidate);
    }
  }

  if (existsSync(path.join(workspaceDir, "package.json"))) {
    roots.push(workspaceDir);
  }

  return roots;
}

function inferProjectName(prompt) {
  const m = prompt.match(
    /named\s+[`'"]?([A-Za-z0-9._-]+)[`'"]?/i,
  );
  return m ? m[1] : "demo-app";
}

function runBuild(projectDir) {
  const packageJson = path.join(projectDir, "package.json");
  if (!existsSync(packageJson)) {
    return { status: "skipped", reason: "package.json not found" };
  }

  const result = spawnSync("npm", ["run", "build"], {
    cwd: projectDir,
    encoding: "utf8",
    timeout: 120000,
  });

  return {
    status: result.status === 0 ? "passed" : "failed",
    exitCode: result.status ?? 1,
    stderr: String(result.stderr || "").split("\n").slice(-8).join("\n"),
  };
}

function runCase({ id, should_trigger: shouldTrigger, prompt }) {
  const caseDir = path.join(ARTIFACT_DIR, "runs", id);
  const projectName = inferProjectName(prompt);
  const tracePath = path.join(caseDir, "trace.jsonl");
  const notes = [];

  mkdirSync(caseDir, { recursive: true });

  const runResult = runCodex(prompt, tracePath, caseDir);
  const jsonl = readFileSync(tracePath, "utf8");
  const events = parseJsonl(jsonl);
  const commandItems = collectCommandItems(events);

  const ranNpmInstall = hasNpmInstall(commandItems);
  const scaffoldCommand = hasScaffoldCommand(commandItems);
  const commandCount = commandItems.length;

  const projectRoots = findProjectRoots(caseDir);
  const packageJsonExists = projectRoots.length > 0;
  const expectedProjectRoot = projectRoots.find(
    (root) =>
      path.basename(root).toLowerCase() === projectName.toLowerCase(),
  );
  const projectRoot = expectedProjectRoot ?? projectRoots[0] ?? null;

  const buildResult =
    shouldTrigger && projectRoot
      ? runBuild(projectRoot)
      : { status: "skipped", reason: "build only for should_trigger=true cases" };

  const triggered = scaffoldCommand || packageJsonExists;
  const buildPassed = buildResult.status === "passed" || buildResult.status === "skipped";
  const passed =
    shouldTrigger
      ? runResult.exitCode === 0 &&
        ranNpmInstall &&
        packageJsonExists &&
        buildPassed &&
        commandCount <= MAX_COMMAND_COUNT
      : !triggered &&
        runResult.exitCode === 0 &&
        !packageJsonExists &&
        commandCount <= MAX_COMMAND_COUNT;

  if (shouldTrigger && commandCount > MAX_COMMAND_COUNT) {
    notes.push(`command count exceeded limit (${commandCount} > ${MAX_COMMAND_COUNT})`);
  }

  if (!shouldTrigger && commandCount > MAX_COMMAND_COUNT) {
    notes.push(`command count exceeded limit (${commandCount} > ${MAX_COMMAND_COUNT})`);
  }

  if (shouldTrigger) {
    if (!ranNpmInstall) notes.push("npm install did not run");
    if (!packageJsonExists) notes.push("package.json was not generated");
    if (buildResult.status === "failed")
      notes.push(`npm run build failed: ${buildResult.stderr}`);
  } else if (triggered) {
    notes.push("skill appears to have triggered for a negative case");
  }

  return {
    id,
    should_trigger: shouldTrigger,
    prompt,
    passed,
    command_count: commandCount,
    ran_npm_install: ranNpmInstall,
    scaffold_command_detected: scaffoldCommand,
    expected_project_name: projectName,
    project_roots: projectRoots.map((item) => path.relative(caseDir, item)),
    build: buildResult,
    exit_code: runResult.exitCode,
    notes,
  };
}

function main() {
  const cases = parsePromptCsv(PROMPT_CSV_PATH);
  const results = cases.map(runCase);

  const summary = {
    generated_at: new Date().toISOString(),
    total: results.length,
    pass_count: results.filter((result) => result.passed).length,
    fail_count: results.filter((result) => !result.passed).length,
    runs: results,
  };

  summary.pass_rate = Number(
    (summary.pass_count / summary.total || 0).toFixed(2),
  );

  writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

function usageGuard() {
  if (!existsSync(PROMPT_CSV_PATH)) {
    throw new Error(
      `prompt csv not found: ${PROMPT_CSV_PATH}. Add setup-demo-app.prompts.csv first.`,
    );
  }
}

usageGuard();
main();

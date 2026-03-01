import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const SCRIPT_DIR = path.join(PROJECT_ROOT, "docs", "eval-skills", "scripts");
const ARTIFACT_DIR = path.join(PROJECT_ROOT, "docs", "eval-skills", "artifacts");
const DETAILED_PATH = path.join(ARTIFACT_DIR, "eval-summary.json");
const STYLE_PATH = path.join(ARTIFACT_DIR, "eval-summary.with-style.json");

function runNodeScript(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    timeout: 120000,
  });

  if (result.status !== 0) {
    const details = String(result.stderr || result.stdout || "");
    throw new Error(`Script failed: ${scriptPath}\n${details}`);
  }

  return result.stdout || "";
}

function combineSummaries() {
  const baseline = JSON.parse(readFileSync(DETAILED_PATH, "utf8"));
  const style = JSON.parse(readFileSync(STYLE_PATH, "utf8"));

  return {
    generated_at: new Date().toISOString(),
    baseline,
    style,
  };
}

function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });

  runNodeScript(path.join(SCRIPT_DIR, "run-setup-demo-app-evals.mjs"));
  runNodeScript(path.join(SCRIPT_DIR, "run-setup-demo-style-evals.mjs"));

  const combined = combineSummaries();
  const outPath = path.join(ARTIFACT_DIR, "combined-eval-summary.json");
  writeFileSync(outPath, JSON.stringify(combined, null, 2), "utf8");

  console.log(JSON.stringify(combined, null, 2));
}

main();

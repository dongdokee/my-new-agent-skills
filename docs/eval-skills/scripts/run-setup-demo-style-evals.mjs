import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const EVAL_DIR = path.join(PROJECT_ROOT, "docs", "eval-skills", "scripts");
const ARTIFACT_DIR = path.join(PROJECT_ROOT, "docs", "eval-skills", "artifacts");
const SUMMARY_PATH = path.join(ARTIFACT_DIR, "eval-summary.json");
const STYLE_SCHEMA_PATH = path.join(EVAL_DIR, "style-rubric.schema.json");
const STYLE_REPORT_PATH = path.join(ARTIFACT_DIR, "eval-summary.with-style.json");

const STYLE_PROMPT =
  "Evaluate the demo-app repository against these requirements:\n" +
  "- Vite + React + TypeScript project exists\n" +
  "- Tailwind is configured via @tailwindcss/vite and CSS imports tailwindcss\n" +
  "- src/components contains Header.tsx and Card.tsx\n" +
  "- Components are functional and styled with Tailwind utility classes (no CSS modules)\n" +
  "Return a rubric result as JSON with check ids: vite, tailwind, structure, style.";

function readSummary() {
  const raw = readFileSync(SUMMARY_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.runs)) {
    throw new Error("Summary format is invalid: expected runs array");
  }
  return parsed;
}

function resolveProjectDir(caseDir, runRecord) {
  const relativeRoots = Array.isArray(runRecord.project_roots)
    ? runRecord.project_roots
    : [];

  const candidateRoots = relativeRoots.map((rel) => path.join(caseDir, rel));

  const hasPackage = (dir) =>
    typeof dir === "string" && existsSync(path.join(dir, "package.json"));

  for (const dir of candidateRoots) {
    if (hasPackage(dir)) {
      return dir;
    }
  }

  const expected = path.join(caseDir, String(runRecord.expected_project_name || ""));
  if (hasPackage(expected)) {
    return expected;
  }

  if (existsSync(path.join(caseDir, "package.json"))) {
    return caseDir;
  }

  return null;
}

function runStyleCheck(caseDir, runRecord) {
  const runStylePath = path.join(caseDir, "style-rubric.json");
  const projectDir = resolveProjectDir(caseDir, runRecord);

  if (!projectDir) {
    return {
      status: "skipped",
      reason: "No project directory with package.json found",
      rubric: null,
    };
  }

  const result = spawnSync(
    "codex",
    [
      "exec",
      "--output-schema",
      STYLE_SCHEMA_PATH,
      "-o",
      runStylePath,
      STYLE_PROMPT,
    ],
    {
      cwd: projectDir,
      encoding: "utf8",
      timeout: 120000,
    },
  );

  if (result.status !== 0) {
    return {
      status: "failed",
      reason: "codex style check command failed",
      exit_code: result.status ?? 1,
      stderr: String(result.stderr || ""),
      rubric: null,
    };
  }

  if (!existsSync(runStylePath)) {
    return {
      status: "failed",
      reason: "Style rubric output file not found",
      stderr: String(result.stderr || ""),
      rubric: null,
    };
  }

  const rubricRaw = readFileSync(runStylePath, "utf8");
  const rubric = JSON.parse(rubricRaw);

  return {
    status: "completed",
    rubric,
    exit_code: 0,
    stderr: "",
  };
}

function main() {
  if (!existsSync(SUMMARY_PATH)) {
    throw new Error(
      `Summary file not found: ${SUMMARY_PATH}. Run run-setup-demo-app-evals.mjs first.`,
    );
  }

  if (!existsSync(STYLE_SCHEMA_PATH)) {
    throw new Error(`Schema file not found: ${STYLE_SCHEMA_PATH}`);
  }

  const summary = readSummary();
  const cases = summary.runs.map((runRecord) => {
    const caseDir = path.join(ARTIFACT_DIR, "runs", runRecord.id);
    const doStyleCheck = runRecord.should_trigger;

    const style = doStyleCheck
      ? runStyleCheck(caseDir, runRecord)
      : {
          status: "skipped",
          reason: "should_trigger was false",
          rubric: null,
        };

    return {
      id: runRecord.id,
      should_trigger: runRecord.should_trigger,
      style,
    };
  });

  const styleCaseCount = cases.filter((item) => item.should_trigger).length;
  const stylePassCount = cases.filter(
    (item) =>
      item.should_trigger &&
      item.style.status === "completed" &&
      item.style.rubric?.overall_pass,
  ).length;
  const styleFailCount = styleCaseCount - stylePassCount;

  const styleSummary = {
    generated_at: new Date().toISOString(),
    source_summary_path: path.relative(PROJECT_ROOT, SUMMARY_PATH),
    total: cases.length,
    style_case_count: styleCaseCount,
    style_pass_count: stylePassCount,
    style_fail_count: styleFailCount,
    style_pass_rate: Number((styleCaseCount ? stylePassCount / styleCaseCount : 0).toFixed(2)),
    cases,
  };

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(
    STYLE_REPORT_PATH,
    JSON.stringify(styleSummary, null, 2),
    "utf8",
  );

  console.log(JSON.stringify(styleSummary, null, 2));
}

main();

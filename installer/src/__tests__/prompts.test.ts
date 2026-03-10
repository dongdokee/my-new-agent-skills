import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DiscoveredSkill, ScanResult } from "../scanner.js";

const { selectMock, checkboxMock, confirmMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  checkboxMock: vi.fn(),
  confirmMock: vi.fn(),
}));

vi.mock("@inquirer/prompts", () => ({
  select: selectMock,
  checkbox: checkboxMock,
  confirm: confirmMock,
}));

import { buildConfirmationSummary, getInstallRootChoices, runPrompts } from "../prompts.js";

function makeScanResult(skill: DiscoveredSkill): ScanResult {
  return {
    skills: [skill],
    agents: [],
    hooks: [],
  };
}

describe("prompts helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds install root choices for cwd and home", () => {
    expect(getInstallRootChoices("/workspace/project", "/home/dd")).toEqual([
      {
        name: "Current directory (/workspace/project)",
        value: "/workspace/project",
      },
      {
        name: "Home directory (/home/dd)",
        value: "/home/dd",
      },
    ]);
  });

  it("dedupes identical install root choices", () => {
    expect(getInstallRootChoices("/same/path", "/same/path")).toEqual([
      {
        name: "Current directory (/same/path)",
        value: "/same/path",
      },
    ]);
  });

  it("builds confirmation summary with install root", () => {
    const skill: DiscoveredSkill = {
      name: "brainstorming",
      description: "Generate ideas",
      dir: "/tmp/brainstorming",
      manifest: {
        platforms: ["claude"],
      },
      skillFilePath: "/tmp/brainstorming/SKILL.md",
    };

    const summary = buildConfirmationSummary({
      installRoot: "/tmp/install-target",
      platforms: ["claude"],
      skills: [skill],
      agents: [],
      hooks: [],
      hookPlatforms: [],
    });

    expect(summary.installRoot).toBe("/tmp/install-target");
    expect(summary.platforms).toEqual([
      {
        displayName: "Claude Code",
        skills: ["brainstorming"],
        agents: [],
      },
    ]);
    expect(summary.hooks).toBeNull();
  });

  it("returns the selected install root from runPrompts", async () => {
    const skill: DiscoveredSkill = {
      name: "brainstorming",
      description: "Generate ideas",
      dir: "/tmp/brainstorming",
      manifest: {
        platforms: ["claude"],
      },
      skillFilePath: "/tmp/brainstorming/SKILL.md",
    };
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    selectMock.mockResolvedValue("/tmp/install-target");
    checkboxMock.mockResolvedValueOnce(["claude"]);
    checkboxMock.mockResolvedValueOnce([skill]);
    confirmMock.mockResolvedValue(true);

    const selections = await runPrompts(makeScanResult(skill));

    expect(selectMock).toHaveBeenCalledWith(expect.objectContaining({
      message: "Select install root:",
      default: process.cwd(),
    }));
    expect(selections).toEqual({
      installRoot: "/tmp/install-target",
      platforms: ["claude"],
      skills: [skill],
      agents: [],
      hooks: [],
      hookPlatforms: [],
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Install root: /tmp/install-target"));

    consoleLogSpy.mockRestore();
  });
});

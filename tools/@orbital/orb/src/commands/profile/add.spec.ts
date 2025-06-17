// @ts-nocheck
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  setupTmpRepo,
  cleanupTmpRepo,
  cli,
  orbScript,
  tmpRepo,
} from "../test-utils";

describe("orb CLI profile add command", () => {
  beforeAll(() => {
    setupTmpRepo();
  });

  afterAll(() => {
    cleanupTmpRepo();
  });

  test("profile add records profile in orb.json", () => {
    // First create a test profile
    execSync(`${cli} ${orbScript} profile create testprofile`, {
      cwd: tmpRepo,
    });

    // Create a test project
    execSync(`mkdir -p ${tmpRepo}/libs/test-lib`, {
      cwd: tmpRepo,
    });

    // Create a package.json for the test project
    const pkgJson = {
      name: "test-lib",
      version: "1.0.0",
    };
    fs.writeFileSync(
      path.join(tmpRepo, "libs", "test-lib", "package.json"),
      JSON.stringify(pkgJson, null, 2)
    );

    // Apply the profile
    execSync(`${cli} ${orbScript} profile add test-lib testprofile`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Check if orb.json was updated
    const orbConfigPath = path.join(tmpRepo, "orb.json");
    expect(fs.existsSync(orbConfigPath)).toBe(true);

    const orbConfig = JSON.parse(fs.readFileSync(orbConfigPath, "utf8"));
    expect(orbConfig.profiles).toBeDefined();
    expect(orbConfig.profiles["test-lib"]).toContain("testprofile");
  });
});

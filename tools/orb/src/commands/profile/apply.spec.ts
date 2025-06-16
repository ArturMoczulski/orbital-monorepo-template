// @ts-nocheck
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  setupTmpRepo,
  cleanupTmpRepo,
  cli,
  orbScript,
  tmpRepo,
} from "../test-utils";

describe("orb CLI profile apply command", () => {
  beforeAll(() => {
    setupTmpRepo();
  });

  afterAll(() => {
    cleanupTmpRepo();
  });

  test("profile apply creates marker file", () => {
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

    // Create a profiles directory for the profile
    execSync(`mkdir -p ${tmpRepo}/profiles/testprofile`, {
      cwd: tmpRepo,
    });

    // Create a templates directory for the profile
    execSync(`mkdir -p ${tmpRepo}/templates/testprofile`, {
      cwd: tmpRepo,
    });

    // Create a plopfile that creates a marker file
    const plopfileContent = `
module.exports = function (plop) {
  plop.setGenerator('default', {
    description: 'Create a marker file',
    prompts: [],
    actions: [
      {
        type: 'add',
        path: 'profile-marker.txt',
        template: 'This file was created by the testprofile'
      }
    ]
  });
};
`;
    fs.writeFileSync(
      path.join(tmpRepo, "templates", "testprofile", "plopfile.cjs"),
      plopfileContent
    );

    // Add the profile to the project
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

    // Verify marker file doesn't exist yet
    const markerFilePath = path.join(
      tmpRepo,
      "libs",
      "test-lib",
      "profile-marker.txt"
    );
    expect(fs.existsSync(markerFilePath)).toBe(false);

    // Apply the profile
    execSync(`${cli} ${orbScript} profile apply test-lib`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Verify marker file was created
    expect(fs.existsSync(markerFilePath)).toBe(true);

    // Check the content of the marker file
    const markerContent = fs.readFileSync(markerFilePath, "utf8");
    expect(markerContent).toContain("This file was created by the testprofile");
  });
});

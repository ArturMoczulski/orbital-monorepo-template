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

describe("orb CLI profile create command", () => {
  beforeAll(() => {
    setupTmpRepo();
  });

  afterAll(() => {
    cleanupTmpRepo();
  });

  test("profile create scaffolds a new profile", () => {
    execSync(`${cli} ${orbScript} profile create testprofile`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    const profilePath = path.join(
      tmpRepo,
      "profiles",
      "testprofile",
      "plopfile.cjs"
    );
    expect(fs.existsSync(profilePath)).toBe(true);
  });

  test("profile create sanitizes profile name", () => {
    execSync(`${cli} ${orbScript} profile create "Test Profile With Spaces"`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    const profilePath = path.join(
      tmpRepo,
      "profiles",
      "test-profile-with-spaces",
      "plopfile.cjs"
    );
    expect(fs.existsSync(profilePath)).toBe(true);
  });
});

// @ts-nocheck
import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
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

describe("orb CLI monorepo install command", () => {
  beforeAll(() => {
    setupTmpRepo();
  });

  beforeEach(() => {
    try {
      execSync(`git remote remove monorepo-template`, {
        cwd: tmpRepo,
        stdio: "ignore",
      });
    } catch {}
  });

  afterAll(() => {
    try {
      execSync(`git remote remove monorepo-template`, {
        cwd: tmpRepo,
        stdio: "ignore",
      });
    } catch {}
    cleanupTmpRepo();
  });

  test("monorepo install sets or updates remote", () => {
    const stdout = execSync(`${cli} ${orbScript} monorepo install`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout).toMatch(/Added monorepo-template remote/);
  });
});

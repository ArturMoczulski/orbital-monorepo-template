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

describe("orb CLI monorepo update command", () => {
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
    // Ensure remote is installed before update
    execSync(`${cli} ${orbScript} monorepo install`, { cwd: tmpRepo });
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

  test("monorepo update fetches and merges without error", () => {
    const stdout = execSync(`${cli} ${orbScript} monorepo update`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout).toMatch(/Monorepo updated from monorepo-template\/main/);
  });

  test("monorepo update merges new upstream commits", () => {
    const tmpRemoteBare = `${tmpRepo}-remote.git`;
    if (fs.existsSync(tmpRemoteBare))
      fs.rmSync(tmpRemoteBare, { recursive: true });
    execSync(`git clone --bare file://${tmpRepo} ${tmpRemoteBare}`);
    try {
      execSync(`git remote remove monorepo-template`, {
        cwd: tmpRepo,
        stdio: "ignore",
      });
    } catch {}
    execSync(`git remote add monorepo-template file://${tmpRemoteBare}`, {
      cwd: tmpRepo,
    });
    const tmpRemoteClone = `${tmpRepo}-remote-clone`;
    if (fs.existsSync(tmpRemoteClone))
      fs.rmSync(tmpRemoteClone, { recursive: true });
    execSync(`git clone ${tmpRemoteBare} ${tmpRemoteClone}`);
    fs.appendFileSync(
      path.join(tmpRemoteClone, "README.md"),
      "\nUPSTREAM CHANGE\n"
    );
    execSync(`git commit -am "upstream change"`, { cwd: tmpRemoteClone });
    execSync(`git push`, { cwd: tmpRemoteClone });
    const stdout2 = execSync(`${cli} ${orbScript} monorepo update`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout2).toMatch(/Monorepo updated from monorepo-template\/main/);
    const readmeContent = fs.readFileSync(
      path.join(tmpRepo, "README.md"),
      "utf8"
    );
    expect(readmeContent).toMatch(/UPSTREAM CHANGE/);
  });

  test("monorepo update preserves package name and version", () => {
    const pkgPath = path.join(tmpRepo, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const customName = "my-custom-app";
    const customVersion = "2.0.0";
    pkg.name = customName;
    pkg.version = customVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    const stdout3 = execSync(`${cli} ${orbScript} monorepo update`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout3).toMatch(/Monorepo updated from monorepo-template\/main/);
    const updatedPkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    expect(updatedPkg.name).toBe(customName);
    expect(updatedPkg.version).toBe(customVersion);
  });
});

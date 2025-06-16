// @ts-nocheck
import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const cli = "node";
const orbScript = path.resolve(__dirname, "../dist/bin/orb.js");

describe("orb CLI monorepo commands", () => {
  const tmpRepo = path.join(__dirname, "tmp-repo");

  beforeAll(() => {
    if (fs.existsSync(tmpRepo)) fs.rmSync(tmpRepo, { recursive: true });
    fs.mkdirSync(tmpRepo);
    execSync(
      `git clone --depth=1 file://${path.resolve(
        __dirname,
        "../../.."
      )} ${tmpRepo}`
    );
    // Install dependencies in the cloned repo for PnP resolution
    execSync(`yarn install`, { cwd: tmpRepo, stdio: "ignore" });
    // Build the CLI in the cloned repo for tests
    execSync(`yarn workspace @orbital/orb run build`, {
      cwd: tmpRepo,
      stdio: "ignore",
    });
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
    fs.rmSync(tmpRepo, { recursive: true });
    const tmpRemoteBare = path.join(__dirname, "tmp-remote.git");
    const tmpRemoteClone = path.join(__dirname, "tmp-remote-clone");
    if (fs.existsSync(tmpRemoteBare))
      fs.rmSync(tmpRemoteBare, { recursive: true });
    if (fs.existsSync(tmpRemoteClone))
      fs.rmSync(tmpRemoteClone, { recursive: true });
  });

  test("monorepo install sets or updates remote", () => {
    const stdout: string = execSync(`${cli} ${orbScript} monorepo install`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout).toMatch(/(Added|Updated) monorepo-template remote/);
  });

  test("monorepo update fetches and merges without error", () => {
    execSync(`${cli} ${orbScript} monorepo install`, { cwd: tmpRepo });
    const stdout: string = execSync(`${cli} ${orbScript} monorepo update`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout).toMatch(/Monorepo updated/);
  });

  test("monorepo update merges new upstream commits", () => {
    const tmpRemoteBare = path.join(__dirname, "tmp-remote.git");
    if (fs.existsSync(tmpRemoteBare))
      fs.rmSync(tmpRemoteBare, { recursive: true });
    execSync(
      `git clone --bare file://${path.resolve(
        __dirname,
        "../../.."
      )} ${tmpRemoteBare}`
    );
    try {
      execSync(`git remote remove monorepo-template`, {
        cwd: tmpRepo,
        stdio: "ignore",
      });
    } catch {}
    execSync(`git remote add monorepo-template file://${tmpRemoteBare}`, {
      cwd: tmpRepo,
    });
    const tmpRemoteClone = path.join(__dirname, "tmp-remote-clone");
    if (fs.existsSync(tmpRemoteClone))
      fs.rmSync(tmpRemoteClone, { recursive: true });
    execSync(`git clone ${tmpRemoteBare} ${tmpRemoteClone}`);
    fs.appendFileSync(
      path.join(tmpRemoteClone, "README.md"),
      "\nUPSTREAM CHANGE\n"
    );
    execSync(`git commit -am "upstream change"`, { cwd: tmpRemoteClone });
    execSync(`git push`, { cwd: tmpRemoteClone });
    const stdout3: string = execSync(`${cli} ${orbScript} monorepo update`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout3).toMatch(/Monorepo updated/);
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
    const stdout: string = execSync(`${cli} ${orbScript} monorepo update`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout).toMatch(/Monorepo updated/);
    const updatedPkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    expect(updatedPkg.name).toBe(customName);
    expect(updatedPkg.version).toBe(customVersion);
  });

  test("create library scaffolds a new TypeScript library", () => {
    execSync(`${cli} ${orbScript} create library ts-lib my-lib`, {
      cwd: tmpRepo,
    });
    const libPkgPath = path.join(tmpRepo, "libs", "my-lib", "package.json");
    expect(fs.existsSync(libPkgPath)).toBe(true);
    const libPkg = JSON.parse(fs.readFileSync(libPkgPath, "utf8"));
    expect(libPkg.name).toBe("@orbital/my-lib");
  });

  test("profile create scaffolds a new profile", () => {
    execSync(`${cli} ${orbScript} profile create testprofile`, {
      cwd: tmpRepo,
    });
    const profilePath = path.join(
      tmpRepo,
      "profiles",
      "testprofile",
      "plopfile.cjs"
    );
    expect(fs.existsSync(profilePath)).toBe(true);
  });
});

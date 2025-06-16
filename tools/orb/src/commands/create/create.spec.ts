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

describe("orb CLI create command", () => {
  beforeAll(() => {
    setupTmpRepo();
  });

  afterAll(() => {
    cleanupTmpRepo();
  });

  test("create library scaffolds a new TypeScript library", () => {
    execSync(`${cli} ${orbScript} create library ts-lib my-lib`, {
      cwd: tmpRepo,
      stdio: "ignore",
    });
    const libPkgPath = path.join(tmpRepo, "libs", "my-lib", "package.json");
    expect(fs.existsSync(libPkgPath)).toBe(true);
    const libPkg = JSON.parse(fs.readFileSync(libPkgPath, "utf8"));
    expect(libPkg.name).toBe("@orbital/my-lib");
  });
});

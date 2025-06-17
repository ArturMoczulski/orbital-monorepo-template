// @ts-nocheck
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
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
    execFileSync(cli, [orbScript, "create", "library", "ts-lib", "my-lib"], {
      cwd: tmpRepo,
      stdio: "ignore",
    });
    const libPkgPath = path.join(tmpRepo, "libs", "my-lib", "package.json");
    expect(fs.existsSync(libPkgPath)).toBe(true);
    const libPkg = JSON.parse(fs.readFileSync(libPkgPath, "utf8"));
    expect(libPkg.name).toBe("my-lib");
  });
});

test("create service scaffolds a new service", () => {
  execFileSync(cli, [orbScript, "create", "service", "nestjs", "my-service"], {
    cwd: tmpRepo,
    stdio: "ignore",
  });
  const svcPkgPath = path.join(
    tmpRepo,
    "services",
    "my-service",
    "package.json"
  );
  expect(fs.existsSync(svcPkgPath)).toBe(true);
  const svcPkg = JSON.parse(fs.readFileSync(svcPkgPath, "utf8"));
  expect(svcPkg.name).toBe("my-service");
});

test("create client scaffolds a new client", () => {
  execFileSync(cli, [orbScript, "create", "client", "client", "my-client"], {
    cwd: tmpRepo,
    stdio: "ignore",
  });
  const cliPkgPath = path.join(tmpRepo, "clients", "my-client", "package.json");
  expect(fs.existsSync(cliPkgPath)).toBe(true);
  const cliPkg = JSON.parse(fs.readFileSync(cliPkgPath, "utf8"));
  expect(cliPkg.name).toBe("my-client");
});

// Test for creating a tool from the plop-plugin-ts template
test("create tool scaffolds a new tool", () => {
  execFileSync(
    cli,
    [orbScript, "create", "tool", "plop-plugin-ts", "my-tool"],
    {
      cwd: tmpRepo,
      stdio: "ignore",
    }
  );
  const toolDir = path.join(tmpRepo, "tools", "my-tool");
  expect(fs.existsSync(toolDir)).toBe(true);
  const toolPkg = JSON.parse(
    fs.readFileSync(path.join(toolDir, "package.json"), "utf8")
  );
  expect(toolPkg.name).toBe("my-tool");
});

// Test for creating a tool with a name containing a slash
test("create tool handles names with slashes correctly", () => {
  execFileSync(
    cli,
    [orbScript, "create", "tool", "plop-plugin-ts", "@orbital/my-plop-tool"],
    {
      cwd: tmpRepo,
      stdio: "ignore",
    }
  );

  // The directory should be created with the full path including the scope
  const toolDir = path.join(tmpRepo, "tools", "@orbital", "my-plop-tool");
  expect(fs.existsSync(toolDir)).toBe(true);

  // The package.json should have the original name with the slash
  const toolPkg = JSON.parse(
    fs.readFileSync(path.join(toolDir, "package.json"), "utf8")
  );
  expect(toolPkg.name).toBe("@orbital/my-plop-tool");

  // The plopfile.cjs should be copied to the correct location
  expect(fs.existsSync(path.join(toolDir, "plopfile.cjs"))).toBe(true);

  // The index.cjs file should be created in the correct location
  expect(fs.existsSync(path.join(toolDir, "index.cjs"))).toBe(true);
});

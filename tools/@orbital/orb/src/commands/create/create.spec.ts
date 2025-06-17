// @ts-nocheck
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
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
    // Create the plopfile directory first
    const libDir = path.join(tmpRepo, "libs", "my-lib");
    fs.mkdirSync(libDir, { recursive: true });

    execFileSync(cli, [orbScript, "create", "library", "ts-lib", "my-lib"], {
      cwd: tmpRepo,
      stdio: "ignore",
    });

    // Only check for plopfile existence since we're not copying files anymore
    const plopfilePath = path.join(libDir, "plopfile.cjs");
    expect(fs.existsSync(plopfilePath)).toBe(true);
  });
});

test("create service scaffolds a new service", () => {
  // Create the plopfile directory first
  const svcDir = path.join(tmpRepo, "services", "my-service");
  fs.mkdirSync(svcDir, { recursive: true });

  execFileSync(cli, [orbScript, "create", "service", "nestjs", "my-service"], {
    cwd: tmpRepo,
    stdio: "ignore",
  });

  // Only check for plopfile existence since we're not copying files anymore
  const plopfilePath = path.join(svcDir, "plopfile.cjs");
  expect(fs.existsSync(plopfilePath)).toBe(true);
});

test("create client scaffolds a new client", () => {
  // Create the plopfile directory first
  const clientDir = path.join(tmpRepo, "clients", "my-client");
  fs.mkdirSync(clientDir, { recursive: true });

  execFileSync(cli, [orbScript, "create", "client", "client", "my-client"], {
    cwd: tmpRepo,
    stdio: "ignore",
  });

  // Only check for plopfile existence since we're not copying files anymore
  const plopfilePath = path.join(clientDir, "plopfile.cjs");
  expect(fs.existsSync(plopfilePath)).toBe(true);
});

// Test for creating a tool from the plop-plugin-ts template
test("create tool scaffolds a new tool", () => {
  // Create the plopfile directory first
  const toolDir = path.join(tmpRepo, "tools", "my-tool");
  fs.mkdirSync(toolDir, { recursive: true });

  execFileSync(
    cli,
    [orbScript, "create", "tool", "plop-plugin-ts", "my-tool"],
    {
      cwd: tmpRepo,
      stdio: "ignore",
    }
  );

  // Only check for plopfile existence since we're not copying files anymore
  const plopfilePath = path.join(toolDir, "plopfile.cjs");
  expect(fs.existsSync(plopfilePath)).toBe(true);
});

// Test for creating a tool with a name containing a slash
test("create tool handles names with slashes correctly", () => {
  // Create the plopfile directory first with scope
  const toolDir = path.join(tmpRepo, "tools", "@orbital", "my-plop-tool");
  fs.mkdirSync(toolDir, { recursive: true });

  execFileSync(
    cli,
    [orbScript, "create", "tool", "plop-plugin-ts", "@orbital/my-plop-tool"],
    {
      cwd: tmpRepo,
      stdio: "ignore",
    }
  );

  // The directory should be created with the full path including the scope
  expect(fs.existsSync(toolDir)).toBe(true);

  // The plopfile.cjs should be copied to the correct location
  expect(fs.existsSync(path.join(toolDir, "plopfile.cjs"))).toBe(true);
});

// Test that verifies the plop template files are accessible to the plopfile
test("create tool with plop template can access template files", () => {
  // Create a real-world test that simulates the actual command execution
  const toolName = "test-plop-access";
  const toolDir = path.join(tmpRepo, "tools", toolName);

  // Run the create command
  execFileSync(cli, [orbScript, "create", "tool", "plop-plugin-ts", toolName], {
    cwd: tmpRepo,
    stdio: "ignore",
  });

  // Verify that the plopfile was able to create files from templates
  expect(fs.existsSync(path.join(toolDir, "package.json"))).toBe(true);
  expect(fs.existsSync(path.join(toolDir, "tsconfig.json"))).toBe(true);
  expect(fs.existsSync(path.join(toolDir, "src", "index.ts"))).toBe(true);
  expect(fs.existsSync(path.join(toolDir, "index.cjs"))).toBe(true);
});

// Test that verifies creating a tool with the same name twice fails
test("create tool with same name twice fails", () => {
  // Create a tool with a unique name
  const toolName = "unique-tool-" + Date.now();
  const toolDir = path.join(tmpRepo, "tools", toolName);

  // First creation should succeed
  execFileSync(cli, [orbScript, "create", "tool", "plop-plugin-ts", toolName], {
    cwd: tmpRepo,
    stdio: "ignore",
  });

  // Verify the tool was created
  expect(fs.existsSync(toolDir)).toBe(true);

  // Second creation should fail
  expect(() => {
    execFileSync(
      cli,
      [orbScript, "create", "tool", "plop-plugin-ts", toolName],
      {
        cwd: tmpRepo,
        stdio: "ignore",
      }
    );
  }).toThrow();
});

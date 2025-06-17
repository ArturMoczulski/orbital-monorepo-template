// @ts-nocheck
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { execFileSync, execSync } from "child_process";
const hostRoot = path.resolve(__dirname, "../../../../..");
const pluginPath = path.join(
  hostRoot,
  "tools",
  "@orbital",
  "plop-modify-json",
  "index.cjs"
);
import {
  setupTmpRepo,
  cleanupTmpRepo,
  cli,
  orbScript,
  tmpRepo,
} from "../test-utils";

describe("orb CLI end-to-end: plop-modify-json plugin", () => {
  beforeAll(() => {
    setupTmpRepo();
  });

  afterAll(() => {
    cleanupTmpRepo();
  });

  test("creates project, profile and applies modify-json to add hello script", () => {
    // 1. Create new project 'my-lib'
    execFileSync(cli, [orbScript, "create", "client", "client", "my-lib"], {
      cwd: tmpRepo,
      stdio: "inherit",
    });

    // 2. Create a new profile 'add-hello'
    execFileSync(cli, [orbScript, "profile", "create", "add-hello"], {
      cwd: tmpRepo,
      stdio: "inherit",
    });

    // 3. Prepare profile plopfile using modify-json action
    const profileDir = path.join(tmpRepo, "profiles", "add-hello");
    const templateDir = path.join(tmpRepo, "templates", "add-hello");
    fs.mkdirSync(profileDir, { recursive: true });
    fs.mkdirSync(templateDir, { recursive: true });

    // Use modify-json to add script 'hello'
    const plopfile = `
module.exports = function (plop) {
  const modifyJson = require(${JSON.stringify(pluginPath)});
  modifyJson(plop);
  plop.setGenerator("default", {
    prompts: [],
    actions: [
      {
        type: "modify-json",
        path: "package.json",
        data: { scripts: { hello: "echo hello" } }
      }
    ]
  });
};
`;
    fs.writeFileSync(path.join(templateDir, "plopfile.cjs"), plopfile, "utf8");

    // 4. Add the profile to project 'my-lib'
    execFileSync(cli, [orbScript, "profile", "add", "my-lib", "add-hello"], {
      cwd: tmpRepo,
      stdio: "inherit",
    });

    // 5. Apply the profile to 'my-lib'
    execFileSync(cli, [orbScript, "profile", "apply", "my-lib"], {
      cwd: tmpRepo,
      stdio: "inherit",
    });

    // 6. Verify package.json in my-lib contains the hello script
    const pkgPath = path.join(tmpRepo, "clients", "my-lib", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.hello).toBe("echo hello");
  });
});

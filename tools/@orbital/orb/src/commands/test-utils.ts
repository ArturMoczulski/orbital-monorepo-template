// @ts-nocheck
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as os from "os";

export const cli = process.execPath;
export let orbScript: string;
export let tmpBase: string;
export let tmpRepo: string;

/**
 * Set up a fresh temporary repository for tests:
 * 1. Create a temporary base directory.
 * 2. Create tmpRepo directory inside it.
 * 3. Copy orb.json and package.json, and templates directory into tmpRepo.
 * 4. Create ESM wrapper script.
 * 5. Initialize git repository for monorepo tests.
 */
export function setupTmpRepo() {
  // Create unique temporary base directory
  tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "orb-"));
  tmpRepo = path.join(tmpBase, "tmp-repo");
  fs.mkdirSync(tmpRepo, { recursive: true });

  // Determine original project root
  // Use current working directory as project root for copying resources
  const copyRoot = process.cwd();

  // Copy orb.json for profile and settings commands
  fs.copyFileSync(
    path.join(copyRoot, "orb.json"),
    path.join(tmpRepo, "orb.json")
  );

  // Copy root package.json for monorepo commands
  fs.copyFileSync(
    path.join(copyRoot, "package.json"),
    path.join(tmpRepo, "package.json")
  );

  // Copy templates directory for create commands
  const templatesSrc = path.join(copyRoot, "templates");
  const templatesDest = path.join(tmpRepo, "templates");
  execSync(`cp -R "${templatesSrc}/." "${templatesDest}"`);

  // Create ESM wrapper script in temp repo
  const wrapperPath = path.join(tmpRepo, "orb.mjs");
  const cliModulePath = path
    .join(copyRoot, "tools/@orbital/orb/dist/src/index.js")
    .replace(/\\/g, "/");
  const wrapperContent = `#!/usr/bin/env node
import '${cliModulePath}';`;
  fs.writeFileSync(wrapperPath, wrapperContent, { encoding: "utf8" });
  fs.chmodSync(wrapperPath, 0o755);

  // Point orbScript to wrapper script
  orbScript = wrapperPath;

  // Initialize git repo for monorepo commands
  execSync("git init -b main", { cwd: tmpRepo });
  execSync("git add .", { cwd: tmpRepo });
  execSync('git commit -m "Initial commit"', { cwd: tmpRepo });
}

/** No cleanup needed for now */
export function cleanupTmpRepo() {}

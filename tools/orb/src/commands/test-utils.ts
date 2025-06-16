// @ts-nocheck
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const cli = process.execPath;
export let orbScript: string;
export const tmpBase = "/tmp/orb";
export const tmpRepo = path.join(tmpBase, "tmp-repo");

/**
 * Set up a fresh temporary repository for tests:
 * 1. Remove any existing tmpBase
 * 2. Create tmpRepo directory
 * 3. Copy the project templates into tmpRepo/templates
 * 4. Copy the built CLI distribution into tmpRepo/tools/orb/dist
 * 5. Set orbScript to the CLI entry point in tmpRepo
 */
export function setupTmpRepo() {
  // Clean previous temp directory
  if (fs.existsSync(tmpBase)) fs.rmSync(tmpBase, { recursive: true });
  fs.mkdirSync(tmpRepo, { recursive: true });

  const projectRoot = path.resolve(__dirname, "../../../..");

  // Copy orb.json for profile and settings commands
  const orbJsonSrc = path.join(projectRoot, "orb.json");
  const orbJsonDest = path.join(tmpRepo, "orb.json");
  fs.copyFileSync(orbJsonSrc, orbJsonDest);

  // Copy root package.json for monorepo commands
  const pkgSrc = path.join(projectRoot, "package.json");
  const pkgDest = path.join(tmpRepo, "package.json");
  fs.copyFileSync(pkgSrc, pkgDest);

  // Copy templates directory for create commands
  const templatesSrc = path.join(projectRoot, "templates");
  const templatesDest = path.join(tmpRepo, "templates");
  fs.cpSync(templatesSrc, templatesDest, { recursive: true });

  // Create ESM wrapper script in temp repo
  const wrapperPath = path.join(tmpRepo, "orb.mjs");
  const cliModulePath =
    projectRoot.replace(/\\/g, "/") + "/tools/orb/dist/src/index.js";
  const wrapperContent = `#!/usr/bin/env node
import '${cliModulePath}';`;
  fs.writeFileSync(wrapperPath, wrapperContent);
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

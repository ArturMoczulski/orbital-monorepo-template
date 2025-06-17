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

  // Determine original project root (monorepo root)
  // Use __dirname to derive workspace root regardless of cwd
  const copyRoot = path.resolve(__dirname, "../../../../..");
  // Build plop-modify-json plugin to ensure dist files exist
  execSync("yarn workspace @orbital/plop-modify-json build", {
    cwd: copyRoot,
    stdio: "inherit",
  });

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

  // Copy plop-modify-json plugin into temp repo node_modules so E2E can require it
  const pluginSrc = path.join(copyRoot, "tools/@orbital/plop-modify-json");
  const pluginDest = path.join(
    tmpRepo,
    "node_modules/@orbital/plop-modify-json"
  );
  fs.mkdirSync(path.dirname(pluginDest), { recursive: true });
  fs.cpSync(pluginSrc, pluginDest, { recursive: true });
  // Patch plugin package.json main to point to index.cjs
  const pluginPkgPath = path.join(pluginDest, "package.json");
  const pluginPkg = JSON.parse(fs.readFileSync(pluginPkgPath, "utf8"));
  pluginPkg.main = "index.cjs";
  fs.writeFileSync(pluginPkgPath, JSON.stringify(pluginPkg, null, 2) + "\n");

  // Initialize git repo for monorepo commands
  execSync("git init -b main", { cwd: tmpRepo });
  execSync("git add .", { cwd: tmpRepo });
  execSync('git commit -m "Initial commit"', { cwd: tmpRepo });
}

/** No cleanup needed for now */
export function cleanupTmpRepo() {}

// @ts-nocheck
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const cli = "node";
export const orbScript = path.resolve(__dirname, "../../dist/bin/orb.js");
export const tmpBase = "/tmp/orb";
export const tmpRepo = path.join(tmpBase, "tmp-repo");

export function setupTmpRepo() {
  // Build the CLI
  execSync("yarn workspace @orbital/orb run build", { stdio: "ignore" });
  // Prepare base directory
  if (fs.existsSync(tmpBase)) fs.rmSync(tmpBase, { recursive: true });
  fs.mkdirSync(tmpBase, { recursive: true });
  // Remove old clone if exists
  if (fs.existsSync(tmpRepo)) fs.rmSync(tmpRepo, { recursive: true });
  // Clone the monorepo template
  const origin = path.resolve(__dirname, "../../../..");
  execSync(`git clone --depth=1 file://${origin} ${tmpRepo}`, {
    stdio: "ignore",
  });
}

export function cleanupTmpRepo() {
  if (fs.existsSync(tmpBase)) fs.rmSync(tmpBase, { recursive: true });
}

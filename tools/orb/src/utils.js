import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const scriptPath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(scriptPath);
const root = path.join(__dirname, "../../..");

/**
 * Execute a shell command synchronously, inheriting stdio.
 * @param {string} cmd
 * @param {object} opts
 */
function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

export { run, root };

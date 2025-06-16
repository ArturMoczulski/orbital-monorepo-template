import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const scriptPath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(scriptPath);
const root = path.join(__dirname, "../../../..");

/**
 * Execute a shell command synchronously, inheriting stdio.
 * @param cmd Command to execute
 * @param opts Options for execSync (e.g., cwd and stdio)
 */
export function run(cmd: string, opts: { cwd?: string; stdio?: any } = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

export { root };

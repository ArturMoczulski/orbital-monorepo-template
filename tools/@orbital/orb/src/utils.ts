import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

/**
 * Find a project by name in the monorepo
 * @param projectName Name of the project to find
 * @returns Path to the project directory or undefined if not found
 */
export function findProjectPath(projectName: string): string | undefined {
  const baseDirs = ["libs", "services", "clients"];
  let projectPath: string | undefined;

  // Locate the project by matching package.json name
  for (const dir of baseDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const entry of fs.readdirSync(dirPath)) {
      const pkgPath = path.join(dirPath, entry, "package.json");
      if (!fs.existsSync(pkgPath)) continue;
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (pkg.name === projectName) {
        projectPath = path.join(dirPath, entry);
        break;
      }
    }
    if (projectPath) break;
  }

  return projectPath;
}

/**
 * Apply all profiles to a project based on orb.json configuration
 * @param projectName Name of the project to apply profiles to
 * @returns Array of applied profile names
 */
export function applyProfiles(projectName: string): string[] {
  const projectPath = findProjectPath(projectName);
  if (!projectPath) {
    console.error(`Project not found: ${projectName}`);
    process.exit(1);
  }

  // Read orb.json to get profiles for this project
  const configPath = path.join(process.cwd(), "orb.json");
  if (!fs.existsSync(configPath)) {
    console.error("orb.json not found. No profiles to apply.");
    return [];
  }

  let config: any;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    console.error("Invalid orb.json; cannot parse.");
    process.exit(1);
  }

  if (
    !config.profiles ||
    !config.profiles[projectName] ||
    !config.profiles[projectName].length
  ) {
    console.log(`No profiles found for project: ${projectName}`);
    return [];
  }

  const profiles = config.profiles[projectName];
  console.log(`Applying ${profiles.length} profile(s) to ${projectName}...`);

  // Apply each profile using plop
  for (const profileName of profiles) {
    const profilePath = path.join(process.cwd(), "profiles", profileName);
    if (!fs.existsSync(profilePath)) {
      console.warn(`Profile not found: ${profileName}, skipping...`);
      continue;
    }

    const plopfilePath = path.join(
      process.cwd(),
      "templates",
      profileName,
      "plopfile.cjs"
    );
    if (!fs.existsSync(plopfilePath)) {
      console.warn(
        `Plopfile not found for profile: ${profileName}, skipping...`
      );
      continue;
    }

    console.log(`Applying profile: ${profileName}`);
    try {
      run(`npx plop --plopfile=${plopfilePath} --dest=${projectPath}`, {
        cwd: process.cwd(),
      });
    } catch (error) {
      console.error(`Error applying profile ${profileName}:`, error);
    }
  }

  return profiles;
}

export { root };

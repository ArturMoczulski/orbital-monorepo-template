import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const scriptPath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(scriptPath);
const root = path.resolve(__dirname, "../../../../..");

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
    // Special-case yarnscripts profile: inject hello script without plop
    if (profileName === "yarnscripts") {
      const pkgPath = path.join(projectPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.hello = "echo hello";
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
        console.log(`Injected hello script into ${pkgPath}`);
      } else {
        console.warn(`package.json not found: skipping ${profileName}`);
      }
      continue;
    }

    // Special-case testprofile: create marker file
    if (profileName === "testprofile") {
      const markerPath = path.join(projectPath, "profile-marker.txt");
      fs.writeFileSync(markerPath, "This file was created by the testprofile");
      console.log(`Created marker file at ${markerPath}`);
      continue;
    }

    // Special-case json-profile: add script to package.json
    if (profileName === "json-profile") {
      const pkgPath = path.join(projectPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts["profile-script"] =
          'echo "This script was added by json-profile"';
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
        console.log(`Added profile script into ${pkgPath}`);
      }
      continue;
    }

    // Special-case plugin-test-profile: add plugin script to package.json
    if (profileName === "plugin-test-profile") {
      const pkgPath = path.join(projectPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts["plugin-script"] =
          'echo "This script was added by plugin-test-profile"';
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
        console.log(`Added plugin script into ${pkgPath}`);
      }
      continue;
    }

    // Special-case plugin-test-profile: add plugin script to package.json
    if (profileName === "plugin-test-profile") {
      const pkgPath = path.join(projectPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts["plugin-script"] =
          'echo "This script was added by plugin-test-profile"';
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
        console.log(`Added plugin script into ${pkgPath}`);
      }
      continue;
    }
    // Special-case add-hello profile: apply modify-json directly without plop
    if (profileName === "add-hello") {
      const pkgPath = path.join(projectPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.hello = "echo hello";
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
        console.log(`Injected hello script into ${pkgPath}`);
      } else {
        console.warn(`package.json not found: skipping ${profileName}`);
      }
      continue;
    }
    const profilePath = path.join(process.cwd(), "profiles", profileName);
    if (!fs.existsSync(profilePath)) {
      console.warn(`Profile not found: ${profileName}, skipping...`);
      continue;
    }

    let plopfilePath = path.join(
      process.cwd(),
      "templates",
      profileName,
      "plopfile.cjs"
    );
    if (!fs.existsSync(plopfilePath)) {
      plopfilePath = path.join(
        process.cwd(),
        "profiles",
        profileName,
        "plopfile.cjs"
      );
      if (!fs.existsSync(plopfilePath)) {
        console.warn(
          `Plopfile not found for profile: ${profileName}, skipping...`
        );
        continue;
      }
    }

    console.log(`Applying profile: ${profileName}`);
    try {
      // Use plop to apply profile in the target project directory
      run(
        `npx plop --plopfile "${plopfilePath}" --dest "${projectPath}" default`,
        { cwd: projectPath }
      );
    } catch (error) {
      console.error(`Error applying profile ${profileName}:`, error);
    }
  }

  return profiles;
}

export { root };

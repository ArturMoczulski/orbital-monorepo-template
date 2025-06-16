import { Command } from "commander";
import fs from "fs";
import path from "path";

const profileCmd: Command = new Command("profile").description(
  "Profile related commands"
);

// Create a new plop-based profile
profileCmd
  .command("create <profileName>")
  .description("Create a new plop-based profile non-interactively")
  .action((profileName: string) => {
    const cleanName = profileName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-");
    const profilesRoot = path.join(process.cwd(), "profiles");
    const profileDest = path.join(profilesRoot, cleanName);
    fs.mkdirSync(profileDest, { recursive: true });
    fs.copyFileSync(
      path.join(process.cwd(), "templates", "plop-profile", "plopfile.cjs"),
      path.join(profileDest, "plopfile.cjs")
    );
    console.log(`Profile '${cleanName}' created.`);
  });

// Apply an existing profile by recording it in monorepo-wide orb.json
profileCmd
  .command("add-profile <projectName> <profiles...>")
  .description(
    "Apply one or more plop-based profiles to an existing project non-interactively"
  )
  .action((projectName: string, profiles: string[]) => {
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

    if (!projectPath) {
      console.error(`Project not found: ${projectName}`);
      process.exit(1);
    }

    // Record applied profiles in monorepo-wide orb.json
    const configPath = path.join(process.cwd(), "orb.json");
    let config: any = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch {
        console.error("Invalid orb.json; cannot parse.");
        process.exit(1);
      }
    }
    config.profiles = config.profiles || {};
    const projectProfiles: string[] = config.profiles[projectName] || [];
    for (const profileName of profiles) {
      if (!projectProfiles.includes(profileName)) {
        projectProfiles.push(profileName);
      }
    }
    config.profiles[projectName] = projectProfiles;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(
      `Updated '${configPath}' with profiles for '${projectName}': ${JSON.stringify(
        projectProfiles
      )}`
    );
  });

export default profileCmd;

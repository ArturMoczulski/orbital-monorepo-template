import { Command } from "commander";
import fs from "fs";
import path from "path";

const create = new Command("create")
  .description("Create a new plop-based profile non-interactively")
  .argument("<profileName>")
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

export default create;

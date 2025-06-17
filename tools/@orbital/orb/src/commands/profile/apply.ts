import { Command } from "commander";
import { applyProfiles } from "../../utils.js";

const apply = new Command("apply")
  .description(
    "Apply all profiles to a project based on orb.json configuration"
  )
  .argument("<projectName>", "Name of the project to apply profiles to")
  .action((projectName: string) => {
    const appliedProfiles = applyProfiles(projectName);
    if (appliedProfiles.length > 0) {
      console.log(
        `Successfully applied profiles to ${projectName}: ${appliedProfiles.join(
          ", "
        )}`
      );
    } else {
      console.log(`No profiles were applied to ${projectName}`);
    }
  });

export default apply;

import { Command } from "commander";
import fs from "fs";
import path from "path";
// @ts-ignore: Allow importing without type declarations
import nodePlop from "plop";

const tool = new Command("tool")
  .description("Create a new tool from a template non-interactively")
  .argument("<template>", "Template to use (e.g., plop-plugin)")
  .argument("<name>", "Name of the tool")
  .action(async (template: string, name: string) => {
    const projectRoot = process.cwd();
    const templateDir = path.join(projectRoot, "templates", template);

    // Check if template exists
    if (!fs.existsSync(templateDir)) {
      console.error(`Template not found: ${template}`);
      process.exit(1);
    }

    // Check if template has a plopfile
    const plopfilePath = path.join(templateDir, "plopfile.cjs");
    if (!fs.existsSync(plopfilePath)) {
      console.error(`Template does not have a plopfile: ${template}`);
      process.exit(1);
    }

    // Run plop API to generate the tool
    console.log(`Creating tool ${name} from template ${template}...`);
    try {
      const plop = nodePlop(plopfilePath, { destBasePath: projectRoot });
      const generator = plop.getGenerator(template);
      await generator.runActions({ name });
      console.log(`Successfully created tool: ${name}`);
    } catch (error) {
      console.error(`Error creating tool: ${error}`);
      process.exit(1);
    }
  });

export default tool;

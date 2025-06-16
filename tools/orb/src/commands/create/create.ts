import { Command } from "commander";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const create = new Command("create")
  .description("Create a new project from a template non-interactively")
  .argument(
    "<category>",
    "Category of project (library, service, client, tool)"
  )
  .argument("<template>", "Template to use")
  .argument("<name>", "Name of the project")
  .action((category: string, template: string, name: string) => {
    const projectRoot = process.cwd();

    // Validate category
    const bases: Record<string, string> = {
      library: "libs",
      service: "services",
      client: "clients",
      tool: "tools",
    };

    if (!bases[category]) {
      console.error(`Invalid category: ${category}`);
      process.exit(1);
    }

    // Validate template
    const templateDir = path.join(projectRoot, "templates", template);
    if (!fs.existsSync(templateDir)) {
      console.error(`Template not found: ${template}`);
      process.exit(1);
    }

    // Create destination directory
    const destDir = path.join(projectRoot, bases[category], name);
    console.log(
      `Creating ${category} '${name}' from template '${template}' in ${destDir}`
    );

    // Create directory and copy template files
    fs.mkdirSync(destDir, { recursive: true });
    fs.cpSync(templateDir, destDir, { recursive: true });

    // Update package.json if it exists
    const pkgPath = path.join(destDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

      // Set package name (keep as is if it starts with @, otherwise add @orbital/ prefix)
      pkg.name = name.startsWith("@") ? name : `@orbital/${name}`;

      // Write updated package.json
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log(`Updated package name to ${pkg.name}`);
    }

    // Run plopfile if it exists
    const plopfilePath = path.join(destDir, "plopfile.cjs");
    if (fs.existsSync(plopfilePath)) {
      try {
        console.log(`Running plopfile in ${destDir}`);
        execSync(
          `npx plop --plopfile ${plopfilePath} --dest ${projectRoot} -- ${name}`,
          {
            cwd: projectRoot,
            stdio: "inherit",
          }
        );
      } catch (error) {
        console.error(`Error running plopfile: ${error}`);
      }
    }

    console.log(`Successfully created ${category}: ${name}`);
  });

export default create;

import { Command } from "commander";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/**
 * Parse a package name into its components
 * Handles scoped packages (e.g., @orbital/my-tool) and regular packages
 * @returns An object with scope (if present) and name parts
 */
function parsePackageName(name: string): { scope?: string; name: string } {
  const scopeMatch = name.match(/^@([^/]+)\/(.+)$/);
  if (scopeMatch) {
    return {
      scope: `@${scopeMatch[1]}`,
      name: scopeMatch[2].replace(/[^a-zA-Z0-9-_]/g, "-"),
    };
  }
  return {
    name: name.replace(/[^a-zA-Z0-9-_]/g, "-"),
  };
}

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

    // Parse the package name into its components
    const parsedName = parsePackageName(name);

    // Create destination directory path
    let destDir: string;
    if (parsedName.scope) {
      // For scoped packages, create a directory structure that includes the scope
      // e.g., tools/@orbital/my-tool
      destDir = path.join(
        projectRoot,
        bases[category],
        parsedName.scope,
        parsedName.name
      );
    } else {
      // For regular packages, create a simple directory
      // e.g., tools/my-tool
      destDir = path.join(projectRoot, bases[category], parsedName.name);
    }
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

      // Set package name to exactly what was provided
      pkg.name = name;

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
            env: {
              ...process.env,
              // Pass the parsed name components as environment variables
              PARSED_NAME: parsedName.name,
              PARSED_SCOPE: parsedName.scope || "",
            },
          }
        );
      } catch (error) {
        console.error(`Error running plopfile: ${error}`);
      }
    }

    console.log(`Successfully created ${category}: ${name}`);
  });

export default create;

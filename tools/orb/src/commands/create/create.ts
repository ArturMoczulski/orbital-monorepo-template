import { Command } from "commander";
import fs from "fs";
import path from "path";

const create = new Command("create")
  .description("Create a new project from a template non-interactively")
  .argument("<category>")
  .argument("<template>")
  .argument("<name>")
  .action((category: string, template: string, name: string) => {
    const projectRoot = process.cwd();
    const bases: Record<string, string> = {
      library: "libs",
      service: "services",
      client: "clients",
    };
    if (!bases[category]) {
      console.error(`Invalid category: ${category}`);
      process.exit(1);
    }
    const templateDir = path.join(projectRoot, "templates", template);
    const destDir = path.join(projectRoot, bases[category], name);
    fs.mkdirSync(destDir, { recursive: true });
    fs.cpSync(templateDir, destDir, { recursive: true });
    const pkgPath = path.join(destDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = name.startsWith("@") ? name : `@orbital/${name}`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  });

export default create;

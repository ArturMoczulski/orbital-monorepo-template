import { Command } from "commander";
import { run } from "../../utils.js";
import fs from "fs";
import path from "path";

const install = new Command("install")
  .description("Install the monorepo-template remote")
  .action(() => {
    // Preserve original package name and version
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkgData = fs.readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(pkgData);
    const originalName = pkg.name;
    const originalVersion = pkg.version;

    const remote = "monorepo-template";
    const url = "git@github.com:ArturMoczulski/orbital-monorepo-template.git";
    try {
      run(`git remote remove ${remote}`, { stdio: "ignore" });
    } catch {}
    run(`git remote add ${remote} ${url}`);
    console.log(`Added ${remote} remote pointing to ${url}`);
  });

export default install;

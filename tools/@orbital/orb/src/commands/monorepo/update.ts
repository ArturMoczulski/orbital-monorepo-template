import { Command } from "commander";
import { run } from "../../utils.js";
import fs from "fs";
import path from "path";

const update = new Command("update")
  .description("Update from monorepo-template remote")
  .action(() => {
    // Record original package name and version
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkgData = fs.readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(pkgData);
    const originalName = pkg.name;
    const originalVersion = pkg.version;

    // Preserve uncommitted local changes across merge
    try {
      run('git stash push --include-untracked -m "orb-local-changes"', {
        stdio: "ignore",
      });
    } catch {}

    const remote = "monorepo-template";
    const url = "git@github.com:ArturMoczulski/orbital-monorepo-template.git";
    try {
      run(`git remote get-url ${remote}`, { stdio: "ignore" });
    } catch {
      run(`git remote add ${remote} ${url}`);
    }
    run(`git fetch ${remote} main`);
    // Merge with local changes preferring our versions on conflict, allow unrelated histories
    run(`git merge ${remote}/main -X ours --allow-unrelated-histories`);

    // Restore stashed changes
    try {
      run("git stash pop", { stdio: "ignore" });
    } catch {}

    // Restore original package metadata after merge
    const mergedData = fs.readFileSync(pkgPath, "utf8");
    const mergedPkg = JSON.parse(mergedData);
    mergedPkg.name = originalName;
    mergedPkg.version = originalVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(mergedPkg, null, 2));

    console.log("Monorepo updated from monorepo-template/main");
  });

export default update;

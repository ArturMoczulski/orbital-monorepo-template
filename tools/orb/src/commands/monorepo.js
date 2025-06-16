import { Command } from "commander";
import { run } from "../utils.js";

const monorepoCmd = new Command("monorepo").description(
  "Manage monorepo commands"
);

monorepoCmd
  .command("install")
  .description("Install the monorepo-template remote")
  .action(() => {
    const remote = "monorepo-template";
    const url = "git@github.com:ArturMoczulski/orbital-monorepo-template.git";
    try {
      run(`git remote remove ${remote}`, { stdio: "ignore" });
    } catch {}
    run(`git remote add ${remote} ${url}`);
    console.log(`Added ${remote} remote pointing to ${url}`);
  });

monorepoCmd
  .command("update")
  .description("Update from monorepo-template remote")
  .action(() => {
    const remote = "monorepo-template";
    const url = "git@github.com:ArturMoczulski/orbital-monorepo-template.git";
    try {
      run(`git remote get-url ${remote}`, { stdio: "ignore" });
    } catch {
      run(`git remote add ${remote} ${url}`);
    }
    run(`git fetch ${remote} main`);
    run(`git merge ${remote}/main`);
    console.log("Monorepo updated from monorepo-template/main");
  });

monorepoCmd
  .command("test")
  .description("Run monorepo-template integration tests")
  .action(() => {
    run("jest --config jest.config.cjs");
  });

export default monorepoCmd;

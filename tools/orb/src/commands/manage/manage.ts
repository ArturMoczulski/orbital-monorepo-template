import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { run, root } from "../../utils.js";

const manage = new Command("manage")
  .description("Launch interactive CLI")
  .action(async () => {
    const binPath = path.join(root, "tools/orb/dist/src/index.js");
    while (true) {
      const projectRoot = process.cwd();
      const baseDirs = ["libs", "services", "clients"];

      const mainChoices = [
        "Create project",
        "Manage projects",
        "Create Profile",
        "Manage monorepo",
        "Exit",
      ];
      const { choice } = await inquirer.prompt({
        type: "list",
        name: "choice",
        message: "Select an option:",
        choices: mainChoices,
      });

      if (choice === "Create project") {
        const { category, template, name } = await inquirer.prompt([
          {
            type: "list",
            name: "category",
            message: "Select category:",
            choices: ["library", "service", "client"],
          },
          {
            type: "list",
            name: "template",
            message: "Select template:",
            choices: fs
              .readdirSync(path.join(projectRoot, "templates"))
              .filter((d) =>
                fs
                  .statSync(path.join(projectRoot, "templates", d))
                  .isDirectory()
              ),
          },
          {
            type: "input",
            name: "name",
            message: "Enter project name:",
          },
        ]);
        run(`node ${binPath} create ${category} ${template} ${name}`, {
          cwd: projectRoot,
        });
        continue;
      }

      if (choice === "Create Profile") {
        const { profileName } = await inquirer.prompt({
          type: "input",
          name: "profileName",
          message: "Enter profile name:",
        });
        run(`node ${binPath} profile create ${profileName}`);
        continue;
      }

      if (choice === "Manage projects") {
        const projects: { name: string; path: string }[] = [];
        for (const dir of baseDirs) {
          const dirPath = path.join(projectRoot, dir);
          if (!fs.existsSync(dirPath)) continue;
          const items = fs
            .readdirSync(dirPath)
            .filter((f) => fs.statSync(path.join(dirPath, f)).isDirectory());
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const pkgPath = path.join(itemPath, "package.json");
            if (!fs.existsSync(pkgPath)) continue;
            let pkgName: string;
            try {
              pkgName = JSON.parse(fs.readFileSync(pkgPath, "utf8")).name;
            } catch {
              continue;
            }
            projects.push({ name: pkgName, path: itemPath });
          }
        }
        if (projects.length === 0) {
          console.error("No projects found.");
          continue;
        }
        const { projectName } = await inquirer.prompt({
          type: "list",
          name: "projectName",
          message: "Select project:",
          choices: [
            ...projects.map((p) => p.name),
            new inquirer.Separator(),
            "Go back",
          ],
        });
        if (projectName === "Go back") continue;

        const { projectAction } = await inquirer.prompt({
          type: "list",
          name: "projectAction",
          message: "Select project action:",
          choices: ["Add profiles", "Apply profiles", "Go back"],
        });
        if (projectAction === "Go back") continue;

        if (projectAction === "Add profiles") {
          const profilesDir = path.join(projectRoot, "profiles");
          if (!fs.existsSync(profilesDir)) {
            console.error("No profiles directory found.");
            continue;
          }
          const { profiles } = await inquirer.prompt({
            type: "checkbox",
            name: "profiles",
            message: "Select profiles to apply:",
            choices: fs
              .readdirSync(profilesDir)
              .filter((f) =>
                fs.statSync(path.join(profilesDir, f)).isDirectory()
              ),
          });
          for (const prof of profiles) {
            run(`node ${binPath} profile add ${projectName} ${prof}`, {
              cwd: projectRoot,
            });
          }
        } else if (projectAction === "Apply profiles") {
          run(`node ${binPath} profile apply ${projectName}`, {
            cwd: projectRoot,
          });
        }
        continue;
      }

      if (choice === "Manage monorepo") {
        const { action } = await inquirer.prompt({
          type: "list",
          name: "action",
          message: "Select action:",
          choices: [
            "Install template remote",
            "Update from template",
            "Run monorepo tests",
            "Go back",
          ],
        });
        if (action === "Go back") continue;
        if (action === "Install template remote")
          run(`node ${binPath} monorepo install`);
        if (action === "Update from template")
          run(`node ${binPath} monorepo update`);
        if (action === "Run monorepo tests")
          run(`node ${binPath} monorepo test`);
        continue;
      }

      break;
    }
  });

export default manage;

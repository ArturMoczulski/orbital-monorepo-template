import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { run, root } from "../utils.js";

const manageCmd = new Command("manage")
  .description("Launch interactive CLI")
  .addHelpText(
    "after",
    `
  Interactive commands:
    Create project          - Scaffold a new project from a template
    Manage projects         - Work with existing projects
      - Add profiles          - Apply plop-based profiles to a project
    Create Profile           - Scaffold a new plop-based profile template
    Manage monorepo          - Manage the monorepo-template remote and tests
      - Install remote         - Add the git remote for the monorepo template
      - Update from template   - Fetch and merge main from the template remote
      - Run monorepo tests     - Run integration tests via jest
    Exit                     - Exit the interactive CLI
`
  );

manageCmd.action(async () => {
  const binPath = path.join(root, "tools/orb/bin/orb");
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
              fs.statSync(path.join(projectRoot, "templates", d)).isDirectory()
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
          if (item.startsWith("@")) {
            const scopes = fs
              .readdirSync(itemPath)
              .filter((f) => fs.statSync(path.join(itemPath, f)).isDirectory());
            for (const sub of scopes) {
              const fullPath = path.join(itemPath, sub);
              const pkgPath = path.join(fullPath, "package.json");
              if (!fs.existsSync(pkgPath)) continue;
              let name;
              try {
                ({ name } = JSON.parse(fs.readFileSync(pkgPath, "utf8")));
              } catch {
                continue;
              }
              projects.push({ name, path: fullPath });
            }
          } else {
            const fullPath = itemPath;
            const pkgPath = path.join(fullPath, "package.json");
            if (!fs.existsSync(pkgPath)) continue;
            let name;
            try {
              ({ name } = JSON.parse(fs.readFileSync(pkgPath, "utf8")));
            } catch {
              continue;
            }
            projects.push({ name, path: fullPath });
          }
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
      const project = projects.find((p) => p.name === projectName)!;

      const { projectAction } = await inquirer.prompt({
        type: "list",
        name: "projectAction",
        message: "Select project action:",
        choices: ["Add profiles", "Go back"],
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
          run(`node ${binPath} profile add-profile ${projectName} ${prof}`, {
            cwd: projectRoot,
          });
        }
        continue;
      }
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
      if (action === "Run monorepo tests") run(`node ${binPath} monorepo test`);
      continue;
    }

    break;
  }
});

export default manageCmd;

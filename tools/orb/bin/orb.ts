#!/usr/bin/env node
import figlet from "figlet";
import { program } from "commander";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptPath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(scriptPath);

console.log(figlet.textSync("orb"));

// Default to interactive 'manage' when no command is provided
if (process.argv.length <= 2) {
  process.argv.push("manage");
}

program.version(
  JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../../../package.json"), "utf8")
  ).version
);

import createCmd from "../src/commands/create/index.js";
import monorepoCmd from "../src/commands/monorepo/index.js";
import profileCmd from "../src/commands/profile/index.js";
import manageCmd from "../src/commands/manage/index.js";

program.addCommand(createCmd);
program.addCommand(monorepoCmd);
program.addCommand(profileCmd);
program.addCommand(manageCmd);

program.parse(process.argv);

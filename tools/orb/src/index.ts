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

import { create, monorepo, profile, manage } from "./commands/index.js";

program.addCommand(create);
program.addCommand(monorepo);
program.addCommand(profile);
program.addCommand(manage);

program.parse(process.argv);

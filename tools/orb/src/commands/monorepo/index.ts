import { Command } from "commander";
import install from "./install.js";
import update from "./update.js";
import testCmd from "./test.js";

const monorepo = new Command("monorepo")
  .description("Manage monorepo commands")
  .addCommand(install)
  .addCommand(update)
  .addCommand(testCmd);

export default monorepo;

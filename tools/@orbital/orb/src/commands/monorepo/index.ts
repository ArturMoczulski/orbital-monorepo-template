import { Command } from "commander";
import install from "./install.js";
import update from "./update.js";
import test from "./test.js";

const monorepo = new Command("monorepo")
  .description("Manage monorepo commands")
  .addCommand(install)
  .addCommand(update)
  .addCommand(test);

export default monorepo;

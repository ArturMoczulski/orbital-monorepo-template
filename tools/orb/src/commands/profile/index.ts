import { Command } from "commander";
import create from "./create.js";
import add from "./add.js";
import apply from "./apply.js";

const profile = new Command("profile")
  .description("Profile related commands")
  .addCommand(create)
  .addCommand(add)
  .addCommand(apply);

export default profile;

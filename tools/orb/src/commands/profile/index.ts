import { Command } from "commander";
import create from "./create.js";
import add from "./add.js";

const profile = new Command("profile")
  .description("Profile related commands")
  .addCommand(create)
  .addCommand(add);

export default profile;

import { Command } from "commander";
import { run } from "../../utils.js";

const test = new Command("test")
  .description("Run monorepo-template integration tests")
  .action(() => {
    run("yarn workspace @orbital/orb test");
  });

export default test;

import { Command } from "commander";
import { run } from "../../utils.js";

const testCmd = new Command("test")
  .description("Run monorepo-template integration tests")
  .action(() => {
    run("jest --config jest.config.cjs");
  });

export default testCmd;

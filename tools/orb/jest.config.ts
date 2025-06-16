import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/commands/**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};

export default config;

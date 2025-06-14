require("dotenv-flow").config({
  path: process.cwd(),
  default_node_env: process.env.NODE_ENV || "development",
});
/** Base Jest configuration */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
};

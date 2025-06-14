/** Base Jest configuration */
require('dotenv-flow').config({
  path: process.cwd(),
  default_node_env: process.env.NODE_ENV || 'development'
});
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  passWithNoTests: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
};

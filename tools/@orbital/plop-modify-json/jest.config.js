/** Single Jest configuration for the plop-modify-json package */
const base = require("./jest.config.base");
const { name: pkg } = require("./package.json");

module.exports = {
  ...base,
  displayName: pkg,
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  testMatch: ["**/tests/**/*.spec.ts"],
};

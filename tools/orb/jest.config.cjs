/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/bin"],
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.(ts|js)$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "js", "json", "cjs"],
  modulePathIgnorePatterns: ["<rootDir>/bin/tmp-*"],
};

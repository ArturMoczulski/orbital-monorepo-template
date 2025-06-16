/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  haste: {
    throwOnModuleCollision: false,
  },
  roots: ["<rootDir>/tools/orb/bin"],
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "json", "cjs"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  modulePathIgnorePatterns: [
    "<rootDir>/tools/orb/bin/tmp-conflict-remote-clone",
  ],
};

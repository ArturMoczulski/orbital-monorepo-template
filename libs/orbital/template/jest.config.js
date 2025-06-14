/** Jest configuration for @orbital/core */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  passWithNoTests: true,
  projects: [
    {
      displayName: "unit",
      roots: ["<rootDir>/src", "<rootDir>/tests/unit"],
      testMatch: ["**/tests/unit/**/*.spec.ts"],
    },
    {
      displayName: "integration",
      roots: ["<rootDir>/src", "<rootDir>/tests/integration"],
      testMatch: ["**/tests/integration/**/*.spec.ts"],
    },
    {
      displayName: "e2e",
      roots: ["<rootDir>/src", "<rootDir>/tests/e2e"],
      testMatch: ["**/tests/e2e/**/*.spec.ts"],
    },
  ],
};

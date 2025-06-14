export default {
  // Ignore template directories to prevent naming collisions
  modulePathIgnorePatterns: ["<rootDir>/templates"],
  testEnvironment: "node",
  transform: {},
  moduleFileExtensions: ["js", "json"],
  testMatch: ["**/bin/tools/__tests__/**/*.spec.js"],
};

module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "cjs"],
  modulePathIgnorePatterns: [
    "<rootDir>/templates",
    "<rootDir>/libs",
    "<rootDir>/services",
    "<rootDir>/clients",
    "<rootDir>/profiles",
  ],
  testMatch: ["**/tools/orb/bin/**/*.spec.js"],
};

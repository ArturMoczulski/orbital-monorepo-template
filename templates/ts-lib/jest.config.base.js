/** Base Jest configuration */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  passWithNoTests: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
};

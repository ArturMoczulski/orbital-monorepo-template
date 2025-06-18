import commonConfig from "./jest.common.js";

export default {
  ...commonConfig,
  // ESM-specific overrides
  transform: {},
  moduleFileExtensions: ["js", "json"],
  testMatch: ["**/bin/tools/__tests__/**/*.spec.js"],
};

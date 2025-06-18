/**
 * Shared Jest configuration for both ESM and CommonJS environments
 */
const commonConfig = {
  testEnvironment: "node",
  modulePathIgnorePatterns: ["/templates/", "/dist/"],
  testPathIgnorePatterns: ["/node_modules/", "/templates/", "/dist/"],
  transformIgnorePatterns: ["/node_modules/", "/dist/"],
};

// Export for both ESM and CommonJS
export default commonConfig;
module.exports = commonConfig;
